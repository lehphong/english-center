using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Enrollments;

public interface IEnrollmentService
{
    Task<PagedResult<EnrollmentDto>> GetPagedAsync(EnrollmentQuery query, CancellationToken cancellationToken);
    Task<EnrollmentDto> GetAsync(int id, CancellationToken cancellationToken);
    Task<EnrollmentDto> CreateAsync(CreateEnrollmentRequest request, CancellationToken cancellationToken);
    Task<EnrollmentDto> UpdateAsync(int id, UpdateEnrollmentRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class EnrollmentService(
    IApplicationDbContext db,
    TimeProvider clock,
    IValidator<CreateEnrollmentRequest> createValidator,
    IValidator<UpdateEnrollmentRequest> updateValidator) : IEnrollmentService
{
    public async Task<PagedResult<EnrollmentDto>> GetPagedAsync(EnrollmentQuery query, CancellationToken cancellationToken)
    {
        var source = db.Enrollments.AsNoTracking()
            .WhereIf(query.Term != null, e => e.Student.FullName.Contains(query.Term!) || e.Student.Code.Contains(query.Term!)
                || e.Class.Code.Contains(query.Term!) || e.Class.Name.Contains(query.Term!))
            .WhereIf(query.ClassId.HasValue, e => e.ClassId == query.ClassId)
            .WhereIf(query.StudentId.HasValue, e => e.StudentId == query.StudentId)
            .WhereIf(query.LearningStatus.HasValue, e => e.LearningStatus == query.LearningStatus)
            // Cùng quy tắc với Enrollment.GetPaymentStatus, viết lại để EF dịch được sang SQL
            .WhereIf(query.PaymentStatus == PaymentStatus.Paid, e => e.AmountPaid >= e.TuitionFee)
            .WhereIf(query.PaymentStatus == PaymentStatus.Partial, e => e.AmountPaid > 0 && e.AmountPaid < e.TuitionFee)
            .WhereIf(query.PaymentStatus == PaymentStatus.Unpaid, e => e.AmountPaid <= 0 && e.AmountPaid < e.TuitionFee)
            .OrderByDescending(e => e.Id)
            .Select(e => new EnrollmentRow(e.Id, e.StudentId, e.Student.Code, e.Student.FullName, e.ClassId,
                e.Class.Code, e.Class.Name, e.Class.Course.Name, e.EnrolledOn, e.TuitionFee, e.AmountPaid, e.LearningStatus));

        var page = await source.ToPagedResultAsync(query, cancellationToken);
        return new PagedResult<EnrollmentDto>(page.Items.Select(r => r.ToDto()).ToList(), page.Page, page.PageSize, page.TotalCount);
    }

    public async Task<EnrollmentDto> GetAsync(int id, CancellationToken cancellationToken)
    {
        var row = await db.Enrollments.AsNoTracking()
            .Where(e => e.Id == id)
            .Select(e => new EnrollmentRow(e.Id, e.StudentId, e.Student.Code, e.Student.FullName, e.ClassId,
                e.Class.Code, e.Class.Name, e.Class.Course.Name, e.EnrolledOn, e.TuitionFee, e.AmountPaid, e.LearningStatus))
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("enrollment", id);

        return row.ToDto();
    }

    public async Task<EnrollmentDto> CreateAsync(CreateEnrollmentRequest request, CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        if (!await db.Students.AnyAsync(s => s.Id == request.StudentId, cancellationToken))
        {
            throw new NotFoundException("student", request.StudentId);
        }

        var courseClass = await db.Classes.Include(c => c.Course)
            .SingleOrDefaultAsync(c => c.Id == request.ClassId, cancellationToken)
            ?? throw new NotFoundException("class", request.ClassId);

        if (await db.Enrollments.AnyAsync(e => e.StudentId == request.StudentId && e.ClassId == request.ClassId, cancellationToken))
        {
            throw new ConflictException("enrollment.duplicate", "The student is already enrolled in this class.");
        }

        courseClass.EnsureHasSeat(await CountOccupiedSeatsAsync(courseClass.Id, cancellationToken));

        var enrollment = new Enrollment
        {
            StudentId = request.StudentId,
            ClassId = request.ClassId,
            EnrolledOn = request.EnrolledOn ?? DateOnly.FromDateTime(clock.GetLocalNow().DateTime),
            TuitionFee = request.TuitionFee ?? courseClass.Course.TuitionFee,
            AmountPaid = request.AmountPaid
        };
        db.Enrollments.Add(enrollment);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(enrollment.Id, cancellationToken);
    }

    public async Task<EnrollmentDto> UpdateAsync(int id, UpdateEnrollmentRequest request, CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var enrollment = await db.Enrollments.Include(e => e.Class)
            .SingleOrDefaultAsync(e => e.Id == id, cancellationToken)
            ?? throw new NotFoundException("enrollment", id);

        // Học viên đã nghỉ / hoàn thành quay lại học thì phải còn chỗ trong lớp
        var seatHoldingStatuses = CourseClass.SeatHoldingStatuses;
        if (!seatHoldingStatuses.Contains(enrollment.LearningStatus) && seatHoldingStatuses.Contains(request.LearningStatus))
        {
            enrollment.Class.EnsureHasSeat(await CountOccupiedSeatsAsync(enrollment.ClassId, cancellationToken));
        }

        enrollment.TuitionFee = request.TuitionFee;
        enrollment.AmountPaid = request.AmountPaid;
        enrollment.LearningStatus = request.LearningStatus;
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var enrollment = await db.Enrollments.FindAsync([id], cancellationToken) ?? throw new NotFoundException("enrollment", id);

        var hasRecords = await db.AttendanceRecords.AnyAsync(a => a.EnrollmentId == id, cancellationToken)
            || await db.Grades.AnyAsync(g => g.EnrollmentId == id, cancellationToken);
        if (hasRecords)
        {
            throw new DomainException("enrollment.hasRecords",
                "The enrollment has attendance or grade records. Change its status to Withdrawn instead.");
        }

        db.Enrollments.Remove(enrollment);
        await db.SaveChangesAsync(cancellationToken);
    }

    private Task<int> CountOccupiedSeatsAsync(int classId, CancellationToken cancellationToken) =>
        db.Enrollments.CountAsync(
            e => e.ClassId == classId && CourseClass.SeatHoldingStatuses.Contains(e.LearningStatus), cancellationToken);

    private sealed record EnrollmentRow(
        int Id, int StudentId, string StudentCode, string StudentName, int ClassId, string ClassCode, string ClassName,
        string CourseName, DateOnly EnrolledOn, decimal TuitionFee, decimal AmountPaid, LearningStatus LearningStatus)
    {
        public EnrollmentDto ToDto() => new(Id, StudentId, StudentCode, StudentName, ClassId, ClassCode, ClassName,
            CourseName, EnrolledOn, TuitionFee, AmountPaid, Math.Max(TuitionFee - AmountPaid, 0),
            Enrollment.GetPaymentStatus(TuitionFee, AmountPaid), LearningStatus);
    }
}
