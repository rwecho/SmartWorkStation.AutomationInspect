using Microsoft.AspNetCore.Mvc;
using SmartWorkStation.AutomationInspect.App.Services;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App.Controllers;

[Route("/api/reports")]
public class ReportsController(CheckingService checkingService) : AbpController
{
    [HttpGet]
    public async Task<IActionResult> GetList(ReportsQueryInput input)
    {
        var reports = await checkingService.GetReportsAsync(input.Id, input.StartTime, input.EndTime);
        return this.Json(reports);
    }
}

