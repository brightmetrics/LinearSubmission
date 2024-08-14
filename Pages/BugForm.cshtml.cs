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
    private readonly ILogger<BugFormModel> logger;
    private readonly string linearTeam;

    public BugFormModel(ILogger<BugFormModel> logger, IConfiguration configuration)
    {
        this.logger = logger;

        linearTeam = configuration["LinearTeam"] ??
            throw new InvalidOperationException("No LinearTeam found in configuration");
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
}}", title?.Trim(), description?.Trim(), linearTeam).Trim();

        var json = new JsonObject()
        {
            ["query"] = query
        };

        logger.LogInformation(json.ToJsonString());

        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var claim = identity!.FindFirst(ClaimTypes.Name)!;

        var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", claim.Value);
        var content = new StringContent(json.ToJsonString(), System.Text.Encoding.UTF8, "application/json");
        var response = await client.PostAsync("https://api.linear.app/graphql", content);
        var responseString = await response.Content.ReadAsStringAsync();

        logger.LogInformation(responseString);

        return Page();
    }
}
