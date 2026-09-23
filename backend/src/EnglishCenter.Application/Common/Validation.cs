using EnglishCenter.Application.Common.Models;
using FluentValidation;

namespace EnglishCenter.Application.Common;

public static class ValidationRules
{
    public const long MaxImageBytes = 2 * 1024 * 1024;

    public static IRuleBuilderOptions<T, string> PhoneNumber<T>(this IRuleBuilder<T, string> rule) =>
        rule.Matches(@"^0\d{9}$").WithErrorCode("phoneNumber.invalid");

    public static IRuleBuilderOptions<T, string> StrongPassword<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().MinimumLength(8).MaximumLength(100);
}

public sealed class ImageUploadValidator : AbstractValidator<FileUpload>
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    public ImageUploadValidator()
    {
        RuleFor(x => x.Length).GreaterThan(0).LessThanOrEqualTo(ValidationRules.MaxImageBytes)
            .WithErrorCode("file.tooLarge");
        RuleFor(x => x.FileName)
            .Must(name => AllowedExtensions.Contains(Path.GetExtension(name).ToLowerInvariant()))
            .WithErrorCode("file.invalidType");
    }
}
