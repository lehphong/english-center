using FluentValidation;

namespace EnglishCenter.Application.Features.Courses;

public sealed class SaveCourseRequestValidator : AbstractValidator<SaveCourseRequest>
{
    public SaveCourseRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.TuitionFee).InclusiveBetween(0, 1_000_000_000);
        RuleFor(x => x.TotalSessions).InclusiveBetween(1, 200);
        RuleFor(x => x.GradingScheme).IsInEnum();
    }
}
