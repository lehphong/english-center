using System.Security.Claims;
using System.Text;
using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace EnglishCenter.Infrastructure.Security;

/// <summary>Tên claim ngắn gọn trong JWT (tắt MapInboundClaims ở API để giữ nguyên các tên này).</summary>
public static class AppClaimTypes
{
    public const string UserId = JwtRegisteredClaimNames.Sub;
    public const string Username = JwtRegisteredClaimNames.UniqueName;
    public const string Role = "role";
    public const string StudentId = "student_id";
}

internal sealed class JwtTokenService(IOptions<JwtOptions> options, TimeProvider clock) : ITokenService
{
    private readonly JwtOptions _options = options.Value;

    public AccessToken CreateAccessToken(User user, int? studentId)
    {
        var now = clock.GetUtcNow();
        var expiresAt = now.AddMinutes(_options.ExpiryMinutes);

        var claims = new List<Claim>
        {
            new(AppClaimTypes.UserId, user.Id.ToString(System.Globalization.CultureInfo.InvariantCulture)),
            new(AppClaimTypes.Username, user.Username),
            new(AppClaimTypes.Role, user.Role.ToString())
        };
        if (studentId.HasValue)
        {
            claims.Add(new Claim(AppClaimTypes.StudentId, studentId.Value.ToString(System.Globalization.CultureInfo.InvariantCulture)));
        }

        var token = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            Subject = new ClaimsIdentity(claims),
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey)), SecurityAlgorithms.HmacSha256)
        });

        return new AccessToken(token, expiresAt);
    }
}
