using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace SmartWorkStation.AutomationInspect.App.Services;


public class AutomationManagerHostedService(StationAutomationManager stationAutomationManager,
    ILogger<AutomationManagerHostedService> logger
    ) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            await stationAutomationManager.StartAsync();
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to start automation manager.");
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        await stationAutomationManager.StopAsync();
    }
}
