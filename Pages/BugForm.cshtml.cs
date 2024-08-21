using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using LinearSubmission.GraphQL;

namespace LinearSubmission.Pages;

[Authorize]
[IgnoreAntiforgeryToken]
public class BugFormModel : PageModel
{
    private record FormData(
        string Title,
        string Description,
        string Product,
        string ZendeskTicketNumber,
        string Customer,
        string User,
        string CustomersImpacted,
        string Urgency,
        string[] StepsToReproduce);

    private readonly ILogger<BugFormModel> logger;
    private readonly HttpClient client = new();
    private readonly string linearTeam;
    private readonly string linearLabels;
    private readonly string graphqlEndpoint;
    private readonly string ticketsEndpoint;

    public BugFormModel(ILogger<BugFormModel> logger, IConfiguration configuration)
    {
        this.logger = logger;

        linearTeam = configuration["LinearTeam"] ??
            throw new InvalidOperationException("No LinearTeam found in configuration");

        linearLabels = configuration["LinearLabels"] ??
            throw new InvalidOperationException("No LinearLabels found in configuration");

        ticketsEndpoint = configuration["ZendeskTicketsEndpoint"] ??
            throw new InvalidOperationException("No ZendeskTicketsEndpoint found in configuration");
        ticketsEndpoint = "https://example.com?ticket="; // TODO

        graphqlEndpoint = configuration["GraphQLEndpoint"] ??
            throw new InvalidOperationException("No GraphQLEndpoint found in configuration");
    }

    public IActionResult OnGet() => Page();

    public async Task<IActionResult> OnPost(
        string title,
        string description,
        string product,
        string zendeskTicketNumber,
        string customer,
        string user,
        string customersImpacted,
        string urgency,
        string[] stepsToReproduce,
        string markdown)
    {
        var form = new FormData(
            title,
            description,
            product,
            zendeskTicketNumber,
            customer,
            user,
            customersImpacted,
            urgency,
            stepsToReproduce);

        var createResponse = await PostToLinearApi(BuildMutationIssueCreatePayload(form, markdown));

        var o = (createResponse["data"]?["issueCreate"]?["issue"]?["id"]) ??
            throw new InvalidOperationException("No issue ID found from newly created issue");
        var newIssueId = (string)o!;

        if (!string.IsNullOrEmpty(form.ZendeskTicketNumber))
        {
            await PostToLinearApi(BuildMutationAttachmentLinkUrlPayload(form, newIssueId));
        }

        var getResponse = await PostToLinearApi(BuildQueryIssuePayload(newIssueId));

        var url = getResponse["data"]?["issue"]?["url"] ??
            throw new InvalidOperationException("No issue URL found when querying information for new issue");

        var sb = new StringBuilder();
        sb.AppendLine("<h3>Submission successful</h3>");
        sb.AppendLine("<br />");
        sb.AppendLine($@"Go to issue <a href=""{url}"">here</a>");
        sb.AppendLine("<br />");
        sb.AppendLine(@"Create another issue <a href=""/BugForm"">here</a>");

        return new ContentResult()
        {
            Content = sb.ToString(),
            ContentType = "text/html",
            StatusCode = (int)System.Net.HttpStatusCode.OK,
        };
    }

    private StringContent BuildQueryIssuePayload(string guid)
    {
        var query = new IssueQuery()
        {
            Variables = new()
            {
                Id = guid,
            }
        };
        return new StringContent(query.ToString(), Encoding.UTF8, "application/json");
    }

    private StringContent BuildMutationAttachmentLinkUrlPayload(
        FormData form,
        string issueId)
    {
        var mutation = new AttachmentLinkUrlMutation()
        {
            Variables = new()
            {
                IssueId = issueId,
                Url = ticketsEndpoint + form.ZendeskTicketNumber!,
            },
        };
        return new StringContent(mutation.ToString(), Encoding.UTF8, "application/json");
    }

    private StringContent BuildMutationIssueCreatePayload(FormData form, string markdown)
    {
        var mutation = new IssueCreateMutation()
        {
            Variables = new()
            {
                Input = new()
                {
                    Title = form.Title?.Trim() ?? "",
                    Description = markdown.Replace("\r", "").Trim(),
                    TeamId = linearTeam,
                    LabelIds = new[] { linearLabels },
                },
            },
        };
        return new StringContent(mutation.ToString(), Encoding.UTF8, "application/json");
    }

    private AuthenticationHeaderValue CreateAuthHeader()
    {
        var identity = (HttpContext.User.Identity as ClaimsIdentity) ??
            throw new InvalidOperationException($"Failed to get {nameof(ClaimsIdentity)}");

        var claim = identity.FindFirst(ClaimTypes.Name) ??
            throw new InvalidOperationException($"Failed to get {nameof(ClaimTypes.Name)}");

        return new AuthenticationHeaderValue("Bearer", claim.Value);
    }

    private async Task<JsonObject> PostToLinearApi(StringContent payload)
    {
        using var request = new HttpRequestMessage();
        request.Headers.Authorization = CreateAuthHeader();
        request.Method = HttpMethod.Post;
        request.Content = payload;
        request.RequestUri = new Uri(graphqlEndpoint);

        var response = await client.SendAsync(request);
        var jsonString = await response.Content.ReadAsStringAsync();

        logger.LogInformation("Response {response}", jsonString);

        return JsonSerializer.Deserialize<JsonObject>(jsonString) ??
            throw new InvalidOperationException("Bad JSON response");
    }
}
