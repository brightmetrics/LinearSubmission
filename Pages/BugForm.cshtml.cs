using System.Net.Http;
using System.Net.Http.Headers;
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
    private readonly ILogger<BugFormModel> _logger;
    private const string testTeam = "ee13a067-68bf-4a61-8c84-d8fd67b7b048";

    public BugFormModel(ILogger<BugFormModel> logger)
    {
        _logger = logger;
    }

    public IActionResult OnGet()
    {
        return Page();
    }

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
        // TODO hacky
        var query = string.Format(@"
mutation IssueCreate {{
  issueCreate(
    input: {{
      title: ""{0}""
      description: ""{1}""
      teamId: ""{2}""
    }}
  ) {{
    success
    issue {{
      id
      title
    }}
  }}
}}", title?.Trim(), description?.Trim(), testTeam).Trim();

        var json = new JsonObject()
        {
            ["query"] = query
        };

        _logger.LogInformation(json.ToJsonString());

        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var claim = identity!.FindFirst(ClaimTypes.Name)!;

        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", claim.Value);
        var content = new StringContent(json.ToJsonString(), System.Text.Encoding.UTF8, "application/json");
        var response = await client.PostAsync("https://api.linear.app/graphql", content);
        var responseString = await response.Content.ReadAsStringAsync();

        _logger.LogInformation(responseString);

        return Page();
    }
}
