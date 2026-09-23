using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Common.Abstractions;

/// <summary>Người dùng của request hiện tại (lấy từ JWT).</summary>
public interface ICurrentUser
{
    int? UserId { get; }
    UserRole? Role { get; }
}
