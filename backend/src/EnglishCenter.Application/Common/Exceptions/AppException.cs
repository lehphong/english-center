namespace EnglishCenter.Application.Common.Exceptions;

/// <summary>Lỗi có mã ổn định để frontend dịch. API chuyển thành ProblemDetails với HTTP status tương ứng.</summary>
public abstract class AppException : Exception
{
    protected AppException(string code, string message) : base(message) => Code = code;

    public string Code { get; }
}

public sealed class NotFoundException(string resource, object key)
    : AppException($"{resource}.notFound", $"{resource} '{key}' was not found.");

public sealed class ConflictException(string code, string message) : AppException(code, message);

public sealed class ForbiddenException(string code, string message) : AppException(code, message);

public sealed class UnauthorizedException(string code, string message) : AppException(code, message);
