using System.Linq.Expressions;
using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Classes;

public interface IClassService
{
    Task<PagedResult<ClassDto>> GetPagedAsync(ClassQuery query, CancellationToken cancellationToken);
    Task<ClassDto> GetAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<OptionDto>> GetOptionsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<ClassStudentDto>> GetStudentsAsync(int id, CancellationToken cancellationToken);
    Task<ClassDto> CreateAsync(SaveClassRequest request, CancellationToken cancellationToken);
    Task<ClassDto> UpdateAsync(int id, SaveClassRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class ClassService(IApplicationDbContext db, IValidator<SaveClassRequest> validator) : IClassService
{
    private static readonly Expression<Func<CourseClass, ClassDto>> ToDto = c => new ClassDto(
        c.Id, c.Code, c.Name, c.CourseId, c.Course.Name, c.TeacherName, c.Schedule, c.Room, c.StartDate, c.EndDate,
        c.MaxCapacity,
        c.Enrollments.Count(e => CourseClass.SeatHoldingStatuses.Contains(e.LearningStatus)));

    public Task<PagedResult<ClassDto>> GetPagedAsync(ClassQuery query, CancellationToken cancellationToken) =>
        db.Classes.AsNoTracking()
            .WhereIf(query.Term != null, c => c.Code.Contains(query.Term!) || c.Name.Contains(query.Term!))
            .WhereIf(query.CourseId.HasValue, c => c.CourseId == query.CourseId)
            .OrderByDescending(c => c.StartDate).ThenByDescending(c => c.Id)
            .Select(ToDto)
            .ToPagedResultAsync(query, cancellationToken);

    public async Task<ClassDto> GetAsync(int id, CancellationToken cancellationToken) =>
        await db.Classes.AsNoTracking().Where(c => c.Id == id).Select(ToDto).SingleOrDefaultAsync(cancellationToken)
        ?? throw new NotFoundException("class", id);

    public async Task<IReadOnlyList<OptionDto>> GetOptionsAsync(CancellationToken cancellationToken) =>
        await db.Classes.AsNoTracking()
            .OrderByDescending(c => c.StartDate)
            .Select(c => new OptionDto(c.Id, c.Code + " - " + c.Name))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<ClassStudentDto>> GetStudentsAsync(int id, CancellationToken cancellationToken)
    {
        if (!await db.Classes.AnyAsync(c => c.Id == id, cancellationToken))
        {
            throw new NotFoundException("class", id);
        }

        var rows = await db.Enrollments.AsNoTracking()
            .Where(e => e.ClassId == id)
            .OrderBy(e => e.Student.FullName)
            .Select(e => new
            {
                e.Id, e.StudentId, e.Student.Code, e.Student.FullName, e.LearningStatus, e.TuitionFee, e.AmountPaid
            })
            .ToListAsync(cancellationToken);

        return rows.Select(r => new ClassStudentDto(r.Id, r.StudentId, r.Code, r.FullName, r.LearningStatus,
            Enrollment.GetPaymentStatus(r.TuitionFee, r.AmountPaid))).ToList();
    }

    public async Task<ClassDto> CreateAsync(SaveClassRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        await EnsureValidAsync(null, request, cancellationToken);

        var entity = new CourseClass { Code = request.Code, Name = request.Name };
        Apply(entity, request);
        db.Classes.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(entity.Id, cancellationToken);
    }

    public async Task<ClassDto> UpdateAsync(int id, SaveClassRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        var entity = await db.Classes.FindAsync([id], cancellationToken) ?? throw new NotFoundException("class", id);
        await EnsureValidAsync(id, request, cancellationToken);

        var occupiedSeats = await db.Enrollments.CountAsync(
            e => e.ClassId == id && CourseClass.SeatHoldingStatuses.Contains(e.LearningStatus), cancellationToken);
        if (request.MaxCapacity < occupiedSeats)
        {
            throw new DomainException("class.capacityBelowEnrolled",
                $"Capacity cannot be lower than the {occupiedSeats} students currently enrolled.");
        }

        Apply(entity, request);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var entity = await db.Classes.FindAsync([id], cancellationToken) ?? throw new NotFoundException("class", id);

        if (await db.Enrollments.AnyAsync(e => e.ClassId == id, cancellationToken))
        {
            throw new DomainException("class.hasEnrollments", "The class cannot be deleted because it has enrollments.");
        }

        db.Classes.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureValidAsync(int? id, SaveClassRequest request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.Classes.AnyAsync(c => c.Code == code && c.Id != id, cancellationToken))
        {
            throw new ConflictException("class.duplicateCode", $"Class code '{code}' already exists.");
        }

        if (!await db.Courses.AnyAsync(c => c.Id == request.CourseId, cancellationToken))
        {
            throw new NotFoundException("course", request.CourseId);
        }
    }

    private static void Apply(CourseClass entity, SaveClassRequest request)
    {
        entity.Code = request.Code.Trim().ToUpperInvariant();
        entity.Name = request.Name.Trim();
        entity.CourseId = request.CourseId;
        entity.TeacherName = request.TeacherName?.Trim();
        entity.Schedule = request.Schedule?.Trim();
        entity.Room = request.Room?.Trim();
        entity.StartDate = request.StartDate;
        entity.EndDate = request.EndDate;
        entity.MaxCapacity = request.MaxCapacity;
    }
}
