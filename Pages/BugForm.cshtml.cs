using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LinearBugSubmission.Pages;

[Authorize]
public class BugFormModel : PageModel
{
    private readonly ILogger<BugFormModel> _logger;

    public BugFormModel(ILogger<BugFormModel> logger)
    {
        _logger = logger;
    }

    public void OnGet()
    {
    }
}

