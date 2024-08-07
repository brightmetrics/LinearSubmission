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

    public IActionResult OnPost(
        string title,
        string description,
        string product,
        string zendeskTicketNumber,
        string customer,
        string user,
        int customersImpacted,
        string urgency,
        string[] stepsToReproduce)
    {
        this._logger.LogInformation($@"POSTED:
            title={title},
            description={description},
            product={product},
            zendeskTicketNumber={zendeskTicketNumber},
            customer={customer},
            user={user},
            customersImpacted={customersImpacted},
            urgency={urgency},
            stepsToReproduce={string.Join(",", stepsToReproduce)}");

        return Page();
    }
}

