using Volo.Abp;
using Volo.Abp.Modularity;
using Volo.Abp.Autofac;
using Volo.Abp.Swashbuckle;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Builder;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.AntiForgery;
using SmartWorkStation.AutomationInspect.App.Services;

namespace SmartWorkStation.AutomationInspect.App;


[DependsOn(
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMvcModule),
    typeof(AbpSwashbuckleModule)
)]
public class AppModule:AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<IMvcBuilder>(mvcBuilder =>
        {
            mvcBuilder.AddApplicationPartIfNotExists(typeof(AppModule).Assembly);
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddMvcCore();

        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    ;
            });
        });

        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(AppModule).Assembly);
        });

        context.Services.Configure<AbpAntiForgeryOptions>(options =>
        {
            options.AutoValidate = false; // Disable auto validation
        });

        context.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "SmartWorkStation",
                Version = "v1"
            });
        });

        context.Services.AddHostedService<AutomationManagerHostedService>();
    }

    public override Task OnApplicationInitializationAsync(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        app.UseCorrelationId();
        app.UseCors();
        app.UseStaticFiles();
        app.UseResponseCaching();
        app.UseRouting();
        app.UseUnitOfWork();
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartWorkStation AutomationInspect API");
        });
        app.UseConfiguredEndpoints();

        return Task.CompletedTask;
    }
}