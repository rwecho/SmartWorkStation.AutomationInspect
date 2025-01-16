using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/")]
public class HelloController: AbpController
{
    [HttpGet]
    public IActionResult Index()
    {
        return Redirect("~/swagger");
    }
}
