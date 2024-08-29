using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;

namespace LinearSubmission;

internal static class Program
{
    public static string EnvPrefix(IConfiguration configuration)
    {
        var prefix = configuration["AppEnv"]; // AppEnv=Sandbox
        if (prefix != null) prefix += "_";
        return prefix ?? "";
    }

    private static IConfigurationRoot GetConfiguration(WebApplicationBuilder builder, string[] commandLineArgs)
    {
        var configBuilder = new ConfigurationBuilder();
        try
        {
            var assemblyName = new AssemblyName(builder.Environment.ApplicationName);
            var appAssembly = Assembly.Load(assemblyName);
            configBuilder.AddUserSecrets(appAssembly, optional: true);
            configBuilder.AddCommandLine(commandLineArgs);
            configBuilder.AddEnvironmentVariables();
        }
        catch (FileNotFoundException)
        {
            // The assembly cannot be found, so just skip it.
        }
        return configBuilder.Build();
    }

    private static void AddServices(WebApplicationBuilder builder, string[] commandLineArgs)
    {
        var configuration = GetConfiguration(builder, commandLineArgs);

        builder.Services.AddRazorPages(o =>
        {
            // Instead of the normal convention of /Pages/*
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
                var prefix = EnvPrefix(configuration);
                options.ClientId = configuration[prefix + "CLIENT_ID"]!;
                options.ClientSecret = configuration[prefix + "CLIENT_SECRET"]!;
                options.Scope.Add("issues:create");
                options.Scope.Add("write");
                options.Events = new OAuthEvents()
                {
                    OnRedirectToAuthorizationEndpoint = ctx =>
                    {
                        // "prompt=consent" forces the user to see the Linear
                        // OAuth page, which allows them to choose a different
                        // workspace (which can be useful)
                        ctx.HttpContext.Response.Redirect(ctx.RedirectUri + "&prompt=consent");
                        return Task.FromResult(0);
                    },
                };
            });
    }

    private static void UseServices(WebApplication app)
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

    private static void Main(string[] args)
    {
        var appEnv = args.FirstOrDefault(a => a.StartsWith("AppEnv"));
        if (appEnv != null)
            Console.WriteLine("\n\nRunning in environment: {0}\n\n", appEnv.Split("=")[1]);

        var builder = WebApplication.CreateBuilder(args);

        AddServices(builder, args);

        var app = builder.Build();

        UseServices(app);

        app.MapRazorPages();

        app.Run();
    }
}
