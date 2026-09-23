using System.Linq.Expressions;
using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Courses;

public interface ICourseService
{
    Task<PagedResult<CourseDto>> GetPagedAsync(CourseQuery query, CancellationToken cancellationToken);
    Task<CourseDto> GetAsync(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<OptionDto>> GetOptionsAsync(bool activeOnly, CancellationToken cancellationToken);
    Task<CourseDto> CreateAsync(SaveCourseRequest request, CancellationToken cancellationToken);
    Task<CourseDto> UpdateAsync(int id, SaveCourseRequest request, CancellationToken cancellationToken);
    Task<CourseDto> UploadThumbnailAsync(int id, FileUpload file, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class CourseService(
    IApplicationDbContext db,
    IFileStorage fileStorage,
    IValidator<SaveCourseRequest> validator,
    IValidator<FileUpload> imageValidator) : ICourseService
{
    private static readonly Expression<Func<Course, CourseDto>> ToDto = c => new CourseDto(
        c.Id, c.Name, c.Description, c.TuitionFee, c.TotalSessions, c.GradingScheme, c.ThumbnailUrl, c.IsActive,
        c.Classes.Count);

    public Task<PagedResult<CourseDto>> GetPagedAsync(CourseQuery query, CancellationToken cancellationToken) =>
        db.Courses.AsNoTracking()
            .WhereIf(query.Term != null, c => c.Name.Contains(query.Term!))
            .WhereIf(query.IsActive.HasValue, c => c.IsActive == query.IsActive)
            .WhereIf(query.GradingScheme.HasValue, c => c.GradingScheme == query.GradingScheme)
            .OrderByDescending(c => c.Id)
            .Select(ToDto)
            .ToPagedResultAsync(query, cancellationToken);

    public async Task<CourseDto> GetAsync(int id, CancellationToken cancellationToken) =>
        await db.Courses.AsNoTracking().Where(c => c.Id == id).Select(ToDto).SingleOrDefaultAsync(cancellationToken)
        ?? throw new NotFoundException("course", id);

    public async Task<IReadOnlyList<OptionDto>> GetOptionsAsync(bool activeOnly, CancellationToken cancellationToken) =>
        await db.Courses.AsNoTracking()
            .WhereIf(activeOnly, c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new OptionDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);

    public async Task<CourseDto> CreateAsync(SaveCourseRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var course = new Course { Name = request.Name.Trim() };
        Apply(course, request);
        db.Courses.Add(course);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(course.Id, cancellationToken);
    }

    public async Task<CourseDto> UpdateAsync(int id, SaveCourseRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var course = await FindAsync(id, cancellationToken);
        Apply(course, request);
        await db.SaveChangesAsync(cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task<CourseDto> UploadThumbnailAsync(int id, FileUpload file, CancellationToken cancellationToken)
    {
        await imageValidator.ValidateAndThrowAsync(file, cancellationToken);

        var course = await FindAsync(id, cancellationToken);
        var previous = course.ThumbnailUrl;
        course.ThumbnailUrl = await fileStorage.SaveAsync(file.Content, file.FileName, "courses", cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        await fileStorage.DeleteAsync(previous, cancellationToken);

        return await GetAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var course = await FindAsync(id, cancellationToken);

        if (await db.Classes.AnyAsync(c => c.CourseId == id, cancellationToken))
        {
            throw new DomainException("course.hasClasses", "The course cannot be deleted because it has classes.");
        }

        db.Courses.Remove(course);
        await db.SaveChangesAsync(cancellationToken);
        await fileStorage.DeleteAsync(course.ThumbnailUrl, cancellationToken);
    }

    private async Task<Course> FindAsync(int id, CancellationToken cancellationToken) =>
        await db.Courses.FindAsync([id], cancellationToken) ?? throw new NotFoundException("course", id);

    private static void Apply(Course course, SaveCourseRequest request)
    {
        course.Name = request.Name.Trim();
        course.Description = request.Description?.Trim();
        course.TuitionFee = request.TuitionFee;
        course.TotalSessions = request.TotalSessions;
        course.GradingScheme = request.GradingScheme;
        course.IsActive = request.IsActive;
    }
}
