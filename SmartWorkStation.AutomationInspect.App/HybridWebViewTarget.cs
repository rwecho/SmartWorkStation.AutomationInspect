using CommunityToolkit.Maui.Alerts;
using SmartWorkStation.AutomationInspect.App.Services;
using Volo.Abp.DependencyInjection;

public class HybridWebViewTarget
{
    public Task<string?> GetStringValue(string key)
    {
        return Task.FromResult((string?)Preferences.Default.Get(key, string.Empty));
    }

    public Task SetStringValue(string key, string value)
    {
        Preferences.Default.Set(key, value);
        return Task.CompletedTask;
    }


    // show snackbar
    public void ShowSnackbar(string message)
    {
        Snackbar.Make(message).Show();
    }


    // show toast
    public void ShowToast(string message)
    {
        Toast.Make(message, CommunityToolkit.Maui.Core.ToastDuration.Short).Show();
    }
}