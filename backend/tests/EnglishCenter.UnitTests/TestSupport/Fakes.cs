using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.UnitTests.TestSupport;

public sealed class FakePasswordHasher : IPasswordHasher
{
    public string Hash(string password) => $"hashed:{password}";
    public bool Verify(string password, string passwordHash) => passwordHash == Hash(password);
}

public sealed class FakeCurrentUser(int? userId = null, UserRole? role = null) : ICurrentUser
{
    public int? UserId { get; set; } = userId;
    public UserRole? Role { get; set; } = role;
}

public sealed class FakeFileStorage : IFileStorage
{
    public List<string> Deleted { get; } = [];

    public Task<string> SaveAsync(Stream content, string fileName, string folder, CancellationToken cancellationToken = default) =>
        Task.FromResult($"/uploads/{folder}/{fileName}");

    public Task DeleteAsync(string? url, CancellationToken cancellationToken = default)
    {
        if (url is not null) Deleted.Add(url);
        return Task.CompletedTask;
    }
}
