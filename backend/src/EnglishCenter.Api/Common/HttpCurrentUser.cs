using System.Globalization;
using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Domain.Enums;
using EnglishCenter.Infrastructure.Security;

namespace EnglishCenter.Api.Common;

internal sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public int? UserId =>
        int.TryParse(accessor.HttpContext?.User.FindFirst(AppClaimTypes.UserId)?.Value, NumberStyles.Integer,
            CultureInfo.InvariantCulture, out var id) ? id : null;

    public UserRole? Role =>
        Enum.TryParse<UserRole>(accessor.HttpContext?.User.FindFirst(AppClaimTypes.Role)?.Value, out var role) ? role : null;
}
