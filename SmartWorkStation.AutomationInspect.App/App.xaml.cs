
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System.Net;
using Volo.Abp;

namespace SmartWorkStation.AutomationInspect.App
{
    public partial class App : Application
    {
        public App(IServiceProvider serviceProvider)
        {
            InitializeComponent();
            ServiceProvider = serviceProvider;
            _createTask = Task.Factory.StartNew(CreateApp);
        }

        private readonly Task _createTask;
        private IHost? _app;

        private async Task CreateApp()
        {
            var configuration = ServiceProvider.GetRequiredService<IConfiguration>();
            var builder = WebApplication.CreateBuilder();
            builder.Host.AddAppSettingsSecretsJson()
                .UseAutofac();

            builder.WebHost.ConfigureKestrel(options =>
            {
                var port = configuration.GetValue<int?>("API:Port") ?? 82;
                options.Listen(IPAddress.Any, port);
            });

            await builder.AddApplicationAsync<AppModule>();
            var app= builder.Build();
            await app.InitializeApplicationAsync();
            _app = app;
            await _app.RunAsync();
        }

        public IServiceProvider ServiceProvider { get; }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            var window = new Window(new AppShell());

            window.Created += (sender, args) =>
            {
                var handle = WinRT.Interop.WindowNative.GetWindowHandle(window.Handler.PlatformView);
                var id = Microsoft.UI.Win32Interop.GetWindowIdFromWindow(handle);
                var appWindow = Microsoft.UI.Windowing.AppWindow.GetFromWindowId(id);
                appWindow.Closing += async (s, e) =>
                {
                    if(_app != null)
                    {
                        await _app.StopAsync();
                        await _createTask;
                    }
                };
            };

            return window;
        }

    }
}
