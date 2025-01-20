using Microsoft.Extensions.Logging;
using CommunityToolkit.Maui;
using Serilog;
using Microsoft.Extensions.Configuration;

namespace SmartWorkStation.AutomationInspect.App;


public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var configuration = GetConfiguration();

        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .CreateLogger();
        Log.Logger.Information("====================Starting application====================");
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseMauiCommunityToolkit(options =>
            {
                options.SetShouldEnableSnackbarOnWindows(true);
            })
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });
        builder.Services.AddSerilog(Log.Logger);
        builder.Services.AddTransient<HybridWebViewTarget>();
        builder.Services.AddMauiBlazorWebView();

#if DEBUG
		builder.Services.AddHybridWebViewDeveloperTools();
		builder.Logging.AddDebug();
#endif
        builder.Services.AddApplication<AppModule>(options =>
        {
            options.Services.ReplaceConfiguration(configuration);
        });
        return builder.Build();
    }


    private static IConfiguration GetConfiguration()
    {
        var appsettingsFiles = Directory.GetFiles(Directory.GetCurrentDirectory(), "appsettings.*.json");
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"appsettings.{environment ?? "Production"}.json", optional: true)
            .AddEnvironmentVariables()
            ;
        foreach (var appsettingsFile in appsettingsFiles)
        {
            var filename = Path.GetFileName(appsettingsFile);
            if (!string.IsNullOrEmpty(environment) && filename.Contains(environment))
            {
                continue;
            }
            if (filename.Contains("Production"))
            {
                continue;
            }
            builder.AddJsonFile(filename, optional: true);
        }
        return builder.Build();
    }
}
