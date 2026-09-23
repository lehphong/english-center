using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Entities;

public class User : AuditableEntity
{
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? LastLoginAt { get; set; }

    /// <summary>Hồ sơ học viên gắn với tài khoản (chỉ có khi Role = Student).</summary>
    public Student? Student { get; set; }
}
