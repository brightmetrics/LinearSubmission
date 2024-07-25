using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LinearBugSubmission.Pages;

[Authorize]
[IgnoreAntiforgeryToken]
public class BugFormModel : PageModel
{
    private readonly ILogger<BugFormModel> _logger;

    public BugFormModel(ILogger<BugFormModel> logger)
    {
        _logger = logger;
    }

    public IActionResult OnGet()
    {
        return Page();
    }

    public IActionResult OnPost(string name, int age)
    {
        this._logger.LogInformation("POST name={name} age={age}", name, age);
        return Page();
    }
}

