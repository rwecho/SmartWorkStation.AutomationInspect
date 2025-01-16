using Microsoft.Maui.Controls;

namespace SmartWorkStation.AutomationInspect.App
{
    public partial class MainPage : ContentPage
    {
        public MainPage(HybridWebViewTarget target)
        {
            InitializeComponent();
            hybridWebView.SetInvokeJavaScriptTarget(target);
        }
    }
}
