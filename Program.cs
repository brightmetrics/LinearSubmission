using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace LinearBugSubmission;

internal class Program
{
    static void Main(string[] args)
    {
        var configBuilder = new ConfigurationBuilder();
        configBuilder.AddJsonFile("appSettings.json",
            optional: false,
            reloadOnChange: true);
        var configRoot = configBuilder.Build();

        var builder = WebApplication.CreateBuilder(args);
        // Add services to the container.
        builder.Services.AddRazorPages();
        builder.Services
            .AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = LinearHandler.SchemeName;
            })
            .AddCookie()
            .AddOAuth<OAuthOptions, LinearHandler>(LinearHandler.SchemeName, options =>
            {
                options.AuthorizationEndpoint = "https://oauth.wiremockapi.cloud/oauth/authorize";
                options.TokenEndpoint = "https://oauth.wiremockapi.cloud/oauth/token";
                // this is a fake endpoint that the OAuthHandler creates in
                // order to complete the OAuth2 flow
                options.CallbackPath = "/signin-linear";
                options.ClientId = configRoot["CLIENT_ID"]!;
                options.ClientSecret = configRoot["CLIENT_SECRET"]!;
            });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
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

        app.MapRazorPages();

        app.Run();
    }
}
