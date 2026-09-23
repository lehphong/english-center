using EnglishCenter.Application.Common.Models;

namespace EnglishCenter.Application.Features.Attendance;

/// <summary>Bảng điểm danh một buổi của một lớp. IsPresent = null nghĩa là buổi đó chưa điểm danh học viên này.</summary>
public sealed record AttendanceSheetDto(
    int ClassId,
    string ClassCode,
    string ClassName,
    int TotalSessions,
    int SessionNumber,
    DateOnly? SessionDate,
    IReadOnlyList<AttendanceRowDto> Rows);

public sealed record AttendanceRowDto(int EnrollmentId, string StudentCode, string StudentName, bool? IsPresent, string? Note);

public sealed record SaveAttendanceRequest(
    int ClassId,
    int SessionNumber,
    DateOnly SessionDate,
    IReadOnlyList<AttendanceEntry> Entries);

public sealed record AttendanceEntry(int EnrollmentId, bool IsPresent, string? Note);

public sealed record AttendanceRecordDto(
    int Id,
    int EnrollmentId,
    string StudentCode,
    string StudentName,
    string ClassCode,
    int SessionNumber,
    DateOnly SessionDate,
    bool IsPresent,
    string? Note);

public sealed record AttendanceQuery : PageQuery
{
    public int? ClassId { get; init; }
    public int? SessionNumber { get; init; }
    public bool? IsPresent { get; init; }
}
