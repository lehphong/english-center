using FluentValidation;

namespace EnglishCenter.Application.Features.Enrollments;

public sealed class CreateEnrollmentRequestValidator : AbstractValidator<CreateEnrollmentRequest>
{
    public CreateEnrollmentRequestValidator()
    {
        RuleFor(x => x.StudentId).GreaterThan(0);
        RuleFor(x => x.ClassId).GreaterThan(0);
        RuleFor(x => x.TuitionFee).InclusiveBetween(0, 1_000_000_000).When(x => x.TuitionFee.HasValue);
        RuleFor(x => x.AmountPaid).InclusiveBetween(0, 1_000_000_000);
    }
}

public sealed class UpdateEnrollmentRequestValidator : AbstractValidator<UpdateEnrollmentRequest>
{
    public UpdateEnrollmentRequestValidator()
    {
        RuleFor(x => x.TuitionFee).InclusiveBetween(0, 1_000_000_000);
        RuleFor(x => x.AmountPaid).InclusiveBetween(0, 1_000_000_000);
        RuleFor(x => x.LearningStatus).IsInEnum();
    }
}
