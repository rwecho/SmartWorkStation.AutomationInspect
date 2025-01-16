using Volo.Abp;
using Volo.Abp.Modularity;
using Volo.Abp.Autofac;
using Volo.Abp.Swashbuckle;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Builder;
using Volo.Abp.AspNetCore.Mvc;

namespace SmartWorkStation.AutomationInspect.App;


[DependsOn(
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMvcModule),
    typeof(AbpSwashbuckleModule)
)]
public class AppModule:AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddMvcCore();
        context.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "SmartWorkStation",
                Version = "v1"
            });
        });
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        //var app = context.GetApplicationBuilder();
        //app.UseCorrelationId();
        //app.UseStaticFiles();
        //app.UseResponseCaching();
        //app.UseRouting();
        //app.UseUnitOfWork();
        //app.UseSwagger();
        //app.UseSwaggerUI(options =>
        //{
        //    options.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartWorkStation API");
        //});
        //app.UseConfiguredEndpoints();
    }
}