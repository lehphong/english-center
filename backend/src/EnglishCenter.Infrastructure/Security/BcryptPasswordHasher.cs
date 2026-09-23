using EnglishCenter.Application.Common.Abstractions;

namespace EnglishCenter.Infrastructure.Security;

internal sealed class BcryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 11;

    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    public bool Verify(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Chuỗi trong database không phải hash BCrypt hợp lệ
            return false;
        }
    }
}
