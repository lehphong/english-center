using System.Globalization;
using EnglishCenter.Application.Common.Abstractions;
using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Extensions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using EnglishCenter.Domain.Services;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.Application.Features.Grades;

public interface IGradeService
{
    Task<GradeSheetDto> GetSheetAsync(int classId, ExamType examType, CancellationToken cancellationToken);
    Task<GradeSheetDto> SaveSheetAsync(SaveGradeSheetRequest request, CancellationToken cancellationToken);
    Task<PagedResult<GradeDto>> GetPagedAsync(GradeQuery query, CancellationToken cancellationToken);
    Task DeleteAsync(int id, CancellationToken cancellationToken);
}

internal sealed class GradeService(IApplicationDbContext db, IValidator<SaveGradeSheetRequest> validator) : IGradeService
{
    public async Task<GradeSheetDto> GetSheetAsync(int classId, ExamType examType, CancellationToken cancellationToken)
    {
        var courseClass = await LoadClassAsync(classId, cancellationToken);

        var rows = await db.Enrollments.AsNoTracking()
            .Where(e => e.ClassId == classId)
            .Select(e => new
            {
                e.Id,
                e.Student.Code,
                e.Student.FullName,
                e.LearningStatus,
                Grade = e.Grades.FirstOrDefault(g => g.ExamType == examType)
            })
            .Where(e => e.LearningStatus != LearningStatus.Withdrawn || e.Grade != null)
            .OrderBy(e => e.FullName)
            .ToListAsync(cancellationToken);

        return new GradeSheetDto(courseClass.Id, courseClass.Code, courseClass.Name, courseClass.Course.GradingScheme, examType,
            rows.Select(r => new GradeRowDto(r.Id, r.Code, r.FullName, r.Grade?.Listening, r.Grade?.Reading,
                r.Grade?.Writing, r.Grade?.Speaking, r.Grade?.Overall, r.Grade?.Feedback)).ToList());
    }

    public async Task<GradeSheetDto> SaveSheetAsync(SaveGradeSheetRequest request, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);
        var courseClass = await LoadClassAsync(request.ClassId, cancellationToken);
        var scheme = courseClass.Course.GradingScheme;

        ValidateScores(scheme, request.Entries);

        var enrollmentIds = request.Entries.Select(e => e.EnrollmentId).ToList();
        var validCount = await db.Enrollments.CountAsync(
            e => e.ClassId == request.ClassId && enrollmentIds.Contains(e.Id), cancellationToken);
        if (validCount != enrollmentIds.Count)
        {
            throw new DomainException("grade.enrollmentNotInClass", "Some students do not belong to this class.");
        }

        var existing = await db.Grades
            .Where(g => g.ExamType == request.ExamType && enrollmentIds.Contains(g.EnrollmentId))
            .ToDictionaryAsync(g => g.EnrollmentId, cancellationToken);

        foreach (var entry in request.Entries)
        {
            var isEmpty = entry is { Listening: null, Reading: null, Writing: null, Speaking: null }
                && string.IsNullOrWhiteSpace(entry.Feedback);
            existing.TryGetValue(entry.EnrollmentId, out var grade);

            if (isEmpty)
            {
                if (grade is not null) db.Grades.Remove(grade);
                continue;
            }

            if (grade is null)
            {
                grade = new Grade { EnrollmentId = entry.EnrollmentId, ExamType = request.ExamType };
                db.Grades.Add(grade);
            }

            grade.Listening = entry.Listening;
            grade.Reading = entry.Reading;
            grade.Writing = entry.Writing;
            grade.Speaking = entry.Speaking;
            grade.Overall = ScoreCalculator.CalculateOverall(scheme, entry.Listening, entry.Reading, entry.Writing, entry.Speaking);
            grade.Feedback = string.IsNullOrWhiteSpace(entry.Feedback) ? null : entry.Feedback.Trim();
        }

        await db.SaveChangesAsync(cancellationToken);
        return await GetSheetAsync(request.ClassId, request.ExamType, cancellationToken);
    }

    public Task<PagedResult<GradeDto>> GetPagedAsync(GradeQuery query, CancellationToken cancellationToken) =>
        db.Grades.AsNoTracking()
            .WhereIf(query.Term != null, g => g.Enrollment.Student.FullName.Contains(query.Term!)
                || g.Enrollment.Student.Code.Contains(query.Term!) || g.Enrollment.Class.Code.Contains(query.Term!))
            .WhereIf(query.ClassId.HasValue, g => g.Enrollment.ClassId == query.ClassId)
            .WhereIf(query.ExamType.HasValue, g => g.ExamType == query.ExamType)
            .OrderByDescending(g => g.Id)
            .Select(g => new GradeDto(g.Id, g.EnrollmentId, g.Enrollment.Student.Code, g.Enrollment.Student.FullName,
                g.Enrollment.Class.Code, g.Enrollment.Class.Course.Name, g.Enrollment.Class.Course.GradingScheme,
                g.ExamType, g.Listening, g.Reading, g.Writing, g.Speaking, g.Overall, g.Feedback))
            .ToPagedResultAsync(query, cancellationToken);

    public async Task DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var grade = await db.Grades.FindAsync([id], cancellationToken) ?? throw new NotFoundException("grade", id);
        db.Grades.Remove(grade);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task<CourseClass> LoadClassAsync(int classId, CancellationToken cancellationToken) =>
        await db.Classes.AsNoTracking().Include(c => c.Course)
            .SingleOrDefaultAsync(c => c.Id == classId, cancellationToken)
        ?? throw new NotFoundException("class", classId);

    private static void ValidateScores(GradingScheme scheme, IReadOnlyList<GradeEntry> entries)
    {
        var failures = new List<ValidationFailure>();
        for (var i = 0; i < entries.Count; i++)
        {
            Check(i, Skill.Listening, entries[i].Listening);
            Check(i, Skill.Reading, entries[i].Reading);
            Check(i, Skill.Writing, entries[i].Writing);
            Check(i, Skill.Speaking, entries[i].Speaking);
        }

        if (failures.Count > 0)
        {
            throw new ValidationException(failures);
        }

        void Check(int index, Skill skill, decimal? score)
        {
            var range = ScoreCalculator.GetRange(scheme, skill);
            if (score is { } value && !range.Contains(value))
            {
                failures.Add(new ValidationFailure(
                    $"Entries[{index}].{skill}",
                    string.Create(CultureInfo.InvariantCulture,
                        $"{skill} score must be between {range.Min} and {range.Max} in steps of {range.Step}."))
                {
                    ErrorCode = "grade.scoreOutOfRange",
                    FormattedMessagePlaceholderValues = new Dictionary<string, object>
                    {
                        ["Min"] = range.Min, ["Max"] = range.Max, ["Step"] = range.Step
                    }
                });
            }
        }
    }
}
