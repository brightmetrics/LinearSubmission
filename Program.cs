using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace LinearBugSubmission;

internal class Program
{
    static IConfigurationRoot GetConfiguration()
    {
        var configBuilder = new ConfigurationBuilder();
        // configBuilder.AddJsonFile("appsettings.json",
        configBuilder.AddJsonFile("secrets.json",
            optional: false,
            reloadOnChange: true);
        return configBuilder.Build();
    }

    static void AddServices(IServiceCollection services)
    {
        var configRoot = GetConfiguration();

        services.AddRazorPages();

        services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = LinearHandler.SchemeName;
            })
            .AddCookie()
            .AddOAuth<OAuthOptions, LinearHandler>(LinearHandler.SchemeName, options =>
            {
                // options.AuthorizationEndpoint = "https://oauth.wiremockapi.cloud/oauth/authorize";
                options.AuthorizationEndpoint = "https://linear.app/oauth/authorize";
                // options.TokenEndpoint = "https://oauth.wiremockapi.cloud/oauth/token";
                options.TokenEndpoint = "https://api.linear.app/oauth/token";
                // this is a fake endpoint that the OAuthHandler creates in
                // order to complete the OAuth2 flow
                options.CallbackPath = "/signin-linear";
                options.ClientId = configRoot["CLIENT_ID"]!;
                options.ClientSecret = configRoot["CLIENT_SECRET"]!;
                options.Scope.Add("issues:create");
            });
    }

    static void UseServices(WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }
        app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
    }

    static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        AddServices(builder.Services);

        var app = builder.Build();

        UseServices(app);

        app.MapRazorPages();

        app.Run();
    }
}
