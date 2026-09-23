using EnglishCenter.Application.Common;
using EnglishCenter.Domain.Enums;
using FluentValidation;

namespace EnglishCenter.Application.Features.Users;

public sealed class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Username).NotEmpty().MinimumLength(4).MaximumLength(50).Matches("^[a-zA-Z0-9._-]+$");
        RuleFor(x => x.Password).StrongPassword();
        RuleFor(x => x.Role).IsInEnum();
        RuleFor(x => x.StudentId).NotNull().When(x => x.Role == UserRole.Student).WithErrorCode("user.studentRequired");
    }
}

public sealed class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.Role).IsInEnum();
        RuleFor(x => x.StudentId).NotNull().When(x => x.Role == UserRole.Student).WithErrorCode("user.studentRequired");
    }
}

public sealed class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator() => RuleFor(x => x.NewPassword).StrongPassword();
}
