using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;

namespace LinearSubmission;

internal static class Program
{
    static IConfigurationRoot GetConfiguration(WebApplicationBuilder builder)
    {
        var configBuilder = new ConfigurationBuilder();
        try
        {
            var assemblyName = new AssemblyName(builder.Environment.ApplicationName);
            var appAssembly = Assembly.Load(assemblyName);
            configBuilder.AddUserSecrets(appAssembly, optional: true);
            configBuilder.AddEnvironmentVariables();
        }
        catch (FileNotFoundException)
        {
            // The assembly cannot be found, so just skip it.
        }
        return configBuilder.Build();
    }

    static void AddServices(WebApplicationBuilder builder)
    {
        var configuration = GetConfiguration(builder);

        builder.Services.AddRazorPages(o =>
        {
            o.RootDirectory = "/";
        });

        builder.Services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = LinearHandler.SchemeName;
            })
            .AddCookie()
            .AddOAuth<OAuthOptions, LinearHandler>(LinearHandler.SchemeName, options =>
            {
                options.AuthorizationEndpoint = "https://linear.app/oauth/authorize";
                options.TokenEndpoint = "https://api.linear.app/oauth/token";
                // this is a fake endpoint that the OAuthHandler creates in
                // order to complete the OAuth2 flow
                options.CallbackPath = "/signin-linear";
                options.ClientId = configuration["CLIENT_ID"]!;
                options.ClientSecret = configuration["CLIENT_SECRET"]!;
                options.Scope.Add("issues:create");
                options.Scope.Add("write");
                options.Events = new OAuthEvents()
                {
                    OnRedirectToAuthorizationEndpoint = ctx =>
                    {
                        ctx.HttpContext.Response.Redirect(ctx.RedirectUri + "&prompt=consent");
                        return Task.FromResult(0);
                    },
                };
            });
    }

    static void UseServices(WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            // The default HSTS value is 30 days. You may want to change this
            // for production scenarios, see https://aka.ms/aspnetcore-hsts.
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

        AddServices(builder);

        var app = builder.Build();

        UseServices(app);

        app.MapRazorPages();

        app.Run();
    }
}
