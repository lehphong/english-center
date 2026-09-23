using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EnglishCenter.Application.Features.Auth;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.IntegrationTests;

public sealed class AuthAndAuthorizationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Login_ReturnsTokenAndProfile()
    {
        var response = await factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new LoginRequest("hv001", ApiFactory.Password), Json.Options);

        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(Json.Options);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrEmpty(auth!.AccessToken));
        Assert.Equal(UserRole.Student, auth.User.Role);
        Assert.NotNull(auth.User.StudentId);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401WithErrorCode()
    {
        var response = await factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new LoginRequest("admin", "wrong-password"), Json.Options);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("auth.invalidCredentials", await ReadCodeAsync(response));
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_Returns401()
    {
        var response = await factory.CreateClient().GetAsync("/api/courses");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task HealthCheck_IsPublic()
    {
        var response = await factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData("staff", "/api/users", HttpStatusCode.Forbidden)]
    [InlineData("staff", "/api/courses", HttpStatusCode.OK)]
    [InlineData("hv001", "/api/courses", HttpStatusCode.Forbidden)]
    [InlineData("hv001", "/api/portal/classes", HttpStatusCode.OK)]
    [InlineData("admin", "/api/portal/classes", HttpStatusCode.Forbidden)]
    [InlineData("admin", "/api/users", HttpStatusCode.OK)]
    public async Task Endpoints_AreRestrictedByRole(string username, string url, HttpStatusCode expected)
    {
        var client = await factory.CreateClientAsync(username);

        var response = await client.GetAsync(url);

        Assert.Equal(expected, response.StatusCode);
    }

    [Fact]
    public async Task Me_ReturnsCurrentUser()
    {
        var client = await factory.CreateClientAsync("staff");

        var me = await client.GetFromJsonAsync<CurrentUserDto>("/api/auth/me", Json.Options);

        Assert.Equal("staff", me!.Username);
        Assert.Equal(UserRole.Staff, me.Role);
    }

    internal static async Task<string?> ReadCodeAsync(HttpResponseMessage response)
    {
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return json.RootElement.GetProperty("code").GetString();
    }
}
