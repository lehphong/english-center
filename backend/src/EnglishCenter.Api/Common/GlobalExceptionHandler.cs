using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Domain.Common;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EnglishCenter.Api.Common;

/// <summary>
/// Chuyển exception thành ProblemDetails (RFC 9457). Mọi lỗi có <c>code</c> ổn định để frontend dịch;
/// lỗi validation có thêm <c>errors</c>: tên field (camelCase) → danh sách { code, message, params }.
/// </summary>
internal sealed class GlobalExceptionHandler(IProblemDetailsService problemDetails, ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    private static readonly HashSet<string> HiddenPlaceholders = ["PropertyName", "PropertyValue", "PropertyPath"];

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, code, title) = exception switch
        {
            ValidationException => (StatusCodes.Status400BadRequest, "validation", "One or more validation errors occurred."),
            UnauthorizedException e => (StatusCodes.Status401Unauthorized, e.Code, e.Message),
            ForbiddenException e => (StatusCodes.Status403Forbidden, e.Code, e.Message),
            NotFoundException e => (StatusCodes.Status404NotFound, e.Code, e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, e.Code, e.Message),
            DomainException e => (StatusCodes.Status422UnprocessableEntity, e.Code, e.Message),
            _ => (StatusCodes.Status500InternalServerError, "server.error", "An unexpected error occurred.")
        };

        if (status == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception for {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);
        }

        var problem = new ProblemDetails { Status = status, Title = title, Instance = httpContext.Request.Path };
        problem.Extensions["code"] = code;

        if (exception is ValidationException validation)
        {
            problem.Extensions["errors"] = validation.Errors
                .GroupBy(f => ToCamelCasePath(f.PropertyName))
                .ToDictionary(g => g.Key, g => g.Select(f => new
                {
                    code = f.ErrorCode,
                    message = f.ErrorMessage,
                    @params = f.FormattedMessagePlaceholderValues?
                        .Where(p => !HiddenPlaceholders.Contains(p.Key))
                        .ToDictionary(p => char.ToLowerInvariant(p.Key[0]) + p.Key[1..], p => p.Value)
                }).ToList());
        }

        httpContext.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception
        });
    }

    /// <summary>"Entries[0].Listening" → "entries[0].listening"</summary>
    private static string ToCamelCasePath(string path) =>
        string.Join('.', path.Split('.').Select(part => part.Length == 0 ? part : char.ToLowerInvariant(part[0]) + part[1..]));
}
