using System.ComponentModel.DataAnnotations;

namespace EnglishCenter.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    [Required] public string Issuer { get; init; } = string.Empty;
    [Required] public string Audience { get; init; } = string.Empty;

    /// <summary>Khóa ký HMAC-SHA256, tối thiểu 32 ký tự. Không commit giá trị thật, đặt qua user-secrets hoặc biến môi trường.</summary>
    [Required, MinLength(32)] public string SigningKey { get; init; } = string.Empty;

    [Range(5, 1440)] public int ExpiryMinutes { get; init; } = 480;
}
