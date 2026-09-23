using FluentValidation;

namespace EnglishCenter.Application.Features.Classes;

public sealed class SaveClassRequestValidator : AbstractValidator<SaveClassRequest>
{
    public SaveClassRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20).Matches("^[A-Za-z0-9-_.]+$");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.CourseId).GreaterThan(0);
        RuleFor(x => x.TeacherName).MaximumLength(100);
        RuleFor(x => x.Schedule).MaximumLength(100);
        RuleFor(x => x.Room).MaximumLength(50);
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate).When(x => x.EndDate.HasValue);
        RuleFor(x => x.MaxCapacity).InclusiveBetween(1, 100);
    }
}
