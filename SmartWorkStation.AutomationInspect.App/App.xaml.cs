using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.Net;
using Volo.Abp;
using Serilog;
using Microsoft.Extensions.Logging;

namespace SmartWorkStation.AutomationInspect.App
{
    public partial class App : Application
    {
        public App(IServiceProvider serviceProvider, ILogger<App> logger)
        {
            InitializeComponent();
            ServiceProvider = serviceProvider;
            _createTask = Task.Factory.StartNew(CreateApp);
            _logger = logger;
        }
        private readonly ILogger<App> _logger;
        private readonly Task _createTask;
        private IHost? _app;

        private async Task CreateApp()
        {
            var configuration = ServiceProvider.GetRequiredService<IConfiguration>();
            var builder = WebApplication.CreateBuilder();
            builder.Host.AddAppSettingsSecretsJson()
                .UseAutofac()
                .UseSerilog();
            var port = configuration.GetValue<int?>("API:Port") ?? 82;
            builder.WebHost.ConfigureKestrel(options =>
            {
                options.Listen(IPAddress.Any, port);
            });

            await builder.AddApplicationAsync<AppModule>();
            var app = builder.Build();
            await app.InitializeApplicationAsync();
            _app = app;
            _logger.LogInformation($"启动API服务, 监听端口 {port}");
            await _app.RunAsync();
        }

        public IServiceProvider ServiceProvider { get; }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            var window = new Window(new AppShell())
            {
                TitleBar = new TitleBar
                {
                    Title = "斧工自动测试工作台",
                    Icon = "Assets/logo.png"
                }
            };

            window.Created += (sender, args) =>
            {
                var handle = WinRT.Interop.WindowNative.GetWindowHandle(window.Handler.PlatformView);
                var id = Microsoft.UI.Win32Interop.GetWindowIdFromWindow(handle);
                var appWindow = Microsoft.UI.Windowing.AppWindow.GetFromWindowId(id);
                appWindow.Closing += async (s, e) =>
                {
                    if (_app != null)
                    {
                        Log.Logger.Information("=====================Closing application===================");
                        await _app.StopAsync();
                        await _createTask;
                    }
                };
            };

            return window;
        }

    }
}
