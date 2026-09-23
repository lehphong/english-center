using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Attendance;

public interface IAttendanceService
{
    Task<AttendanceSheetDto> GetSheetAsync(int classId, int sessionNumber, CancellationToken cancellationToken);
    Task<AttendanceSheetDto> SaveSheetAsync(SaveAttendanceRequest request, CancellationToken cancellationToken);
    Task<PagedResult<AttendanceRecordDto>> GetPagedAsync(AttendanceQuery query, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class AttendanceService(IApplicationDbContext db, IValidator<SaveAttendanceRequest> validator)
    : IAttendanceService
{
    public async Task<AttendanceSheetDto> GetSheetAsync(int classId, int sessionNumber, CancellationToken cancellationToken)
    {
        var courseClass = await LoadClassAsync(classId, sessionNumber, cancellationToken);

        // Học viên đang học, cộng thêm người đã có bản ghi ở buổi này (dù sau đó đã nghỉ)
        var rows = await db.Enrollments.AsNoTracking()
            .Where(e => e.ClassId == classId)
            .Select(e => new
            {
                e.Id,
                e.Student.Code,
                e.Student.FullName,
                e.LearningStatus,
                Record = e.AttendanceRecords.FirstOrDefault(a => a.SessionNumber == sessionNumber)
            })
            .Where(e => e.LearningStatus == LearningStatus.Studying || e.Record != null)
            .OrderBy(e => e.FullName)
            .ToListAsync(cancellationToken);

        return new AttendanceSheetDto(courseClass.Id, courseClass.Code, courseClass.Name, courseClass.Course.TotalSessions,
            sessionNumber,
            rows.Select(r => r.Record?.SessionDate).FirstOrDefault(d => d.HasValue),
            rows.Select(r => new AttendanceRowDto(r.Id, r.Code, r.FullName, r.Record?.IsPresent, r.Record?.Note)).ToList());
    }

    public async Task<AttendanceSheetDto> SaveSheetAsync(SaveAttendanceRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        await LoadClassAsync(request.ClassId, request.SessionNumber, cancellationToken);

        var enrollmentIds = request.Entries.Select(e => e.EnrollmentId).ToList();
        var validIds = await db.Enrollments
            .Where(e => e.ClassId == request.ClassId && enrollmentIds.Contains(e.Id))
            .Select(e => e.Id)
            .ToListAsync(cancellationToken);
        if (validIds.Count != enrollmentIds.Count)
        {
            throw new DomainException("attendance.enrollmentNotInClass", "Some students do not belong to this class.");
        }

        var existing = await db.AttendanceRecords
            .Where(a => a.SessionNumber == request.SessionNumber && enrollmentIds.Contains(a.EnrollmentId))
            .ToDictionaryAsync(a => a.EnrollmentId, cancellationToken);

        foreach (var entry in request.Entries)
        {
            if (!existing.TryGetValue(entry.EnrollmentId, out var record))
            {
                record = new AttendanceRecord { EnrollmentId = entry.EnrollmentId, SessionNumber = request.SessionNumber };
                db.AttendanceRecords.Add(record);
            }

            record.SessionDate = request.SessionDate;
            record.IsPresent = entry.IsPresent;
            record.Note = string.IsNullOrWhiteSpace(entry.Note) ? null : entry.Note.Trim();
        }

        await db.SaveChangesAsync(cancellationToken);
        return await GetSheetAsync(request.ClassId, request.SessionNumber, cancellationToken);
    }

    public Task<PagedResult<AttendanceRecordDto>> GetPagedAsync(AttendanceQuery query, CancellationToken cancellationToken) =>
        db.AttendanceRecords.AsNoTracking()
            .WhereIf(query.Term != null, a => a.Enrollment.Student.FullName.Contains(query.Term!)
                || a.Enrollment.Student.Code.Contains(query.Term!))
            .WhereIf(query.ClassId.HasValue, a => a.Enrollment.ClassId == query.ClassId)
            .WhereIf(query.SessionNumber.HasValue, a => a.SessionNumber == query.SessionNumber)
            .WhereIf(query.IsPresent.HasValue, a => a.IsPresent == query.IsPresent)
            .OrderByDescending(a => a.SessionDate).ThenBy(a => a.Enrollment.Student.FullName)
            .Select(a => new AttendanceRecordDto(a.Id, a.EnrollmentId, a.Enrollment.Student.Code,
                a.Enrollment.Student.FullName, a.Enrollment.Class.Code, a.SessionNumber, a.SessionDate, a.IsPresent, a.Note))
            .ToPagedResultAsync(query, cancellationToken);

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var record = await db.AttendanceRecords.FindAsync([id], cancellationToken)
            ?? throw new NotFoundException("attendance", id);
        db.AttendanceRecords.Remove(record);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<CourseClass> LoadClassAsync(int classId, int sessionNumber, CancellationToken cancellationToken)
    {
        var courseClass = await db.Classes.AsNoTracking().Include(c => c.Course)
            .SingleOrDefaultAsync(c => c.Id == classId, cancellationToken)
            ?? throw new NotFoundException("class", classId);

        if (sessionNumber < 1 || sessionNumber > courseClass.Course.TotalSessions)
        {
            throw new DomainException("attendance.invalidSession",
                $"Session must be between 1 and {courseClass.Course.TotalSessions}.");
        }
        return courseClass;
    }
}
