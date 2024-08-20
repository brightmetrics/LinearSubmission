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
    private readonly string mutationIssueCreateTemplate = @"
mutation IssueCreate {
  issueCreate(
    input: {
      title: ""<%TITLE%>""
      description: ""<%DESCRIPTION%>""
      teamId: ""<%TEAM_ID%>""
      labelIds: [""<%LABEL_IDS%>""]
    }
  ) {
    success
    issue {
      id
      title
    }
  }
}";
    private readonly string queryIssueTemplate = @"
query {
  issue(id: ""<%ID%>"") {
    number,
    identifier,
    url
  }
}";

    public BugFormModel(ILogger<BugFormModel> logger, IConfiguration configuration)
    {
        this.logger = logger;

        linearTeam = configuration["LinearTeam"] ??
            throw new InvalidOperationException("No LinearTeam found in configuration");

        linearLabels = configuration["LinearLabels"] ??
            throw new InvalidOperationException("No LinearLabels found in configuration");

        graphqlEndpoint = configuration["GraphQLEndpoint"] ??
            throw new InvalidOperationException("No GraphQLEndpoint found in configuration");

        // Clean the templates for usage, since it looks better in source when
        // pretty-printed
        queryIssueTemplate = Regex.Replace(queryIssueTemplate.Trim(), @"\s+", " ");
        mutationIssueCreateTemplate = Regex.Replace(mutationIssueCreateTemplate.Trim(), @"\s+", " ");
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

        var newIssueId = createResponse["data"]?["issueCreate"]?["issue"]?["id"] ??
            throw new InvalidOperationException("No issue ID found from newly created issue");

        var getResponse = await PostToLinearApi(BuildQueryIssuePayload((string)newIssueId!));

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
        var query = queryIssueTemplate.Replace("<%ID%>", guid);
        var jsonString = new JsonObject() { ["query"] = query }.ToJsonString();

        return new StringContent(jsonString, Encoding.UTF8, "application/json");
    }

    private StringContent BuildMutationIssueCreatePayload(FormData form, string markdown)
    {
        var query = mutationIssueCreateTemplate
            .Replace("<%TITLE%>", form.Title?.Trim())
            .Replace("<%DESCRIPTION%>", markdown
                    .Replace("\r", "")
                    .Replace("\n", "\\n")
                    .Trim())
            .Replace("<%TEAM_ID%>", linearTeam)
            .Replace("<%LABEL_IDS%>", linearLabels);

        var jsonString = new JsonObject() { ["query"] = query }.ToJsonString();

        return new StringContent(jsonString, Encoding.UTF8, "application/json");
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
