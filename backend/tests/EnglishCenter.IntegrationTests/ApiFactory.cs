using System.Net.Http.Headers;
using System.Net.Http.Json;
using EnglishCenter.Application.Features.Auth;
using EnglishCenter.Infrastructure.Persistence;
using EnglishCenter.Infrastructure.Persistence.Interceptors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace EnglishCenter.IntegrationTests;

/// <summary>Chạy API trong bộ nhớ với SQLite in-memory và dữ liệu mẫu của DataSeeder.</summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string Password = "Passw0rd!";

    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public ApiFactory() => _connection.Open();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("Database:InitMode", "EnsureCreated");
        builder.UseSetting("Database:Seed", "true");
        builder.UseSetting("Jwt:SigningKey", "integration-tests-signing-key-0123456789abcdef");
        builder.UseSetting("FileStorage:RootPath", Path.Combine(Path.GetTempPath(), "englishcenter-tests", Guid.NewGuid().ToString("N")));

        builder.ConfigureServices(services =>
        {
            foreach (var descriptor in services.Where(d =>
                         d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                         d.ServiceType == typeof(IDbContextOptionsConfiguration<ApplicationDbContext>)).ToList())
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>((provider, options) => options
                .UseSqlite(_connection)
                .AddInterceptors(provider.GetRequiredService<AuditableEntityInterceptor>()));
        });
    }

    public async Task<HttpClient> CreateClientAsync(string username)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(username, Password), Json.Options);
        response.EnsureSuccessStatusCode();

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(Json.Options);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.AccessToken);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}
