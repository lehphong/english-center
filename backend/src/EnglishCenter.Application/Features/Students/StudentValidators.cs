using EnglishCenter.Application.Common;
using FluentValidation;

namespace EnglishCenter.Application.Features.Students;

public sealed class SaveStudentRequestValidator : AbstractValidator<SaveStudentRequest>
{
    public SaveStudentRequestValidator(TimeProvider clock)
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(20).Matches("^[A-Za-z0-9-_.]+$");
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
        RuleFor(x => x.PhoneNumber).NotEmpty().PhoneNumber();
        RuleFor(x => x.Address).MaximumLength(250);
        RuleFor(x => x.Gender).IsInEnum();
        RuleFor(x => x.EntryLevel).IsInEnum();
        RuleFor(x => x.DateOfBirth)
            .LessThan(_ => DateOnly.FromDateTime(clock.GetLocalNow().DateTime))
            .When(x => x.DateOfBirth.HasValue);
    }
}

public sealed class CreateStudentRequestValidator : AbstractValidator<CreateStudentRequest>
{
    public CreateStudentRequestValidator(TimeProvider clock)
    {
        Include(new SaveStudentRequestValidator(clock));

        When(x => x.CreateAccount, () =>
        {
            RuleFor(x => x.Username).MinimumLength(4).MaximumLength(50).Matches("^[a-zA-Z0-9._-]+$")
                .When(x => !string.IsNullOrWhiteSpace(x.Username));
            RuleFor(x => x.Password!).StrongPassword();
        });
    }
}
