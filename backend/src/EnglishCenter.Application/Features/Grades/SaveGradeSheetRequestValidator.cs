using FluentValidation;

namespace EnglishCenter.Application.Features.Grades;

/// <summary>Kiểm tra cấu trúc. Khoảng điểm phụ thuộc thang điểm của khóa học nên được kiểm tra trong GradeService.</summary>
public sealed class SaveGradeSheetRequestValidator : AbstractValidator<SaveGradeSheetRequest>
{
    public SaveGradeSheetRequestValidator()
    {
        RuleFor(x => x.ClassId).GreaterThan(0);
        RuleFor(x => x.ExamType).IsInEnum();
        RuleFor(x => x.Entries).NotEmpty();
        RuleForEach(x => x.Entries).ChildRules(entry =>
        {
            entry.RuleFor(e => e.EnrollmentId).GreaterThan(0);
            entry.RuleFor(e => e.Feedback).MaximumLength(500);
        });
        RuleFor(x => x.Entries)
            .Must(entries => entries.Select(e => e.EnrollmentId).Distinct().Count() == entries.Count)
            .WithErrorCode("grade.duplicateEntry");
    }
}
