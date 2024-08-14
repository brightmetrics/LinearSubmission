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
    private readonly ILogger<BugFormModel> logger;
    private readonly HttpClient client = new();
    private readonly string linearTeam;
    private readonly string issueCreateQueryTemplate = @"
mutation IssueCreate {
  issueCreate(
    input: {
      title: ""<%TITLE%>""
      description: ""<%DESCRIPTION%>""
      teamId: ""<%TEAM_ID%>""
    }
  ) {
    success
    issue {
      id
      title
    }
  }
}";

    public BugFormModel(ILogger<BugFormModel> logger, IConfiguration configuration)
    {
        this.logger = logger;

        linearTeam = configuration["LinearTeam"] ??
            throw new InvalidOperationException("No LinearTeam found in configuration");
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
        string[] stepsToReproduce)
    {
        var query = Regex.Replace(issueCreateQueryTemplate.Trim(), @"\s+", " ")
            .Replace("<%TITLE%>", title?.Trim())
            .Replace("<%DESCRIPTION%>", description?.Trim())
            .Replace("<%TEAM_ID%>", linearTeam);

        var queryJson = new JsonObject()
        {
            ["query"] = query
        }.ToJsonString();

        logger.LogDebug("Request body ==> {responseString}", queryJson.Replace(@"\u0022", "'"));

        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var claim = identity!.FindFirst(ClaimTypes.Name)!;

        using var request = new HttpRequestMessage();
        request.Method = HttpMethod.Post;
        request.Content = new StringContent(queryJson, Encoding.UTF8, "application/json");
        request.RequestUri = new Uri("https://api.linear.app/graphql");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", claim.Value);

        var response = await client.SendAsync(request);
        var responseString = await response.Content.ReadAsStringAsync();

        logger.LogDebug("Response body ==> {responseString}", responseString);

        return Content("Submission successful");
    }
}
