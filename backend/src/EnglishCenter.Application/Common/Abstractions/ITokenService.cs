using EnglishCenter.Domain.Entities;

namespace EnglishCenter.Application.Common.Abstractions;

public sealed record AccessToken(string Token, DateTimeOffset ExpiresAt);

public interface ITokenService
{
    AccessToken CreateAccessToken(User user, int? studentId);
}
