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

namespace LinearSubmission;

[Authorize]
[IgnoreAntiforgeryToken]
public class IndexModel : PageModel
{
    public bool IsPostBack { get; set; }
    public string? NewIssueUrl { get; set; }

    private record FormData(
        string Title,
        string Description,
        string Product,
        string ZendeskTicketNumber,
        string Customer,
        string User,
        string CustomersImpacted,
        int Urgency,
        string[] StepsToReproduce,
        string Markdown);

    private readonly ILogger<IndexModel> logger;
    private readonly HttpClient client = new();
    private readonly string linearTeam;
    private readonly string graphqlEndpoint;
    private readonly string ticketsEndpoint;

    public IndexModel(ILogger<IndexModel> logger, IConfiguration configuration)
    {
        this.logger = logger;

        linearTeam = configuration["LinearTeam"] ??
            throw new InvalidOperationException("No LinearTeam found in configuration");

        ticketsEndpoint = configuration["ZendeskTicketsEndpoint"] ??
            throw new InvalidOperationException("No ZendeskTicketsEndpoint found in configuration");

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
        int urgency,
        string[] stepsToReproduce,
        string markdown)
    {
        IsPostBack = true;

        var form = new FormData(
            title,
            description,
            product,
            zendeskTicketNumber,
            customer,
            user,
            customersImpacted,
            urgency,
            stepsToReproduce,
            markdown);

        var payload = await BuildMutationIssueCreatePayload(form);
        var createResponse = await PostToLinearApi(payload);

        var o = (createResponse["data"]?["issueCreate"]?["issue"]?["id"]) ??
            throw new InvalidOperationException("No issue ID found from newly created issue");
        var newIssueId = (string)o!;

        if (!string.IsNullOrEmpty(form.ZendeskTicketNumber))
        {
            await PostToLinearApi(BuildMutationAttachmentLinkUrlPayload(form, newIssueId));
        }

        var getResponse = await PostToLinearApi(BuildQueryIssuePayload(newIssueId));

        NewIssueUrl = (string?)getResponse["data"]?["issue"]?["url"] ??
            throw new InvalidOperationException("No issue URL found when querying information for new issue");

        return Page();
    }

    private StringContent BuildQueryLabelsPayload()
    {
        var query = new LabelsQuery()
        {
            Variables = new()
            {
                TeamId = linearTeam,
            },
        };
        return new StringContent(query.ToString(), Encoding.UTF8, "application/json");
    }

    private StringContent BuildQueryIssuePayload(string guid)
    {
        var query = new IssueQuery()
        {
            Variables = new()
            {
                Id = guid,
            },
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

    private async Task<StringContent> BuildMutationIssueCreatePayload(FormData form)
    {
        var labels = await QueryTeamLabels();
        var labelsToAttach = new List<string>(); // IDs

        var bugLabel = labels.Find(x => x.Name?.StartsWith("Bug") == true);
        if (!string.IsNullOrEmpty(bugLabel?.Id))
            labelsToAttach.Add(bugLabel.Id);

        var productLabel = labels.Find(x => x.Name == form.Product);
        if (!string.IsNullOrEmpty(productLabel?.Id))
            labelsToAttach.Add(productLabel.Id);

        var mutation = new IssueCreateMutation()
        {
            Variables = new()
            {
                Input = new()
                {
                    Title = form.Title?.Trim() ?? "",
                    Description = form.Markdown.Replace("\r", "").Trim(),
                    TeamId = linearTeam,
                    LabelIds = labelsToAttach.ToArray(),
                    Priority = form.Urgency,
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

    private async Task<List<LinearLabel>> QueryTeamLabels()
    {
        var getResponse = await PostToLinearApi(BuildQueryLabelsPayload());
        var array = getResponse["data"]?["team"]?["organization"]?["labels"]?["nodes"]?.AsArray();
        if (array?.Any() != true)
            return [];

        var list = new List<LinearLabel>();
        foreach (var node in array)
        {
            list.Add(new LinearLabel()
            {
                Id = (string?)node!["id"],
                Name = (string?)node!["name"],
            });
        }
        return list;
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

        logger.LogInformation("Response --> {response}", jsonString);

        return JsonSerializer.Deserialize<JsonObject>(jsonString) ??
            throw new InvalidOperationException("Bad JSON response");
    }
}
