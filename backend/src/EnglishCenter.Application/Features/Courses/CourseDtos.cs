using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Application.Features.Courses;

public sealed record CourseDto(
    int Id,
    string Name,
    string? Description,
    decimal TuitionFee,
    int TotalSessions,
    GradingScheme GradingScheme,
    string? ThumbnailUrl,
    bool IsActive,
    int ClassCount);

public sealed record SaveCourseRequest(
    string Name,
    string? Description,
    decimal TuitionFee,
    int TotalSessions,
    GradingScheme GradingScheme,
    bool IsActive);

public sealed record CourseQuery : PageQuery
{
    public bool? IsActive { get; init; }
    public GradingScheme? GradingScheme { get; init; }
}
