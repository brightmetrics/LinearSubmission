using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace WebApp3;

internal class Program
{
    static void Main(string[] args)
    {
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
                options.CallbackPath = "/sign-in";
                options.ClientId = "<id>";
                options.ClientSecret = "<secret>";
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

        app.MapGet("/sign-in", () => "ok");

        app.MapRazorPages();

        app.Run();
    }
}
