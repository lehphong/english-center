using FluentValidation;

namespace EnglishCenter.Application.Features.Attendance;

public sealed class SaveAttendanceRequestValidator : AbstractValidator<SaveAttendanceRequest>
{
    public SaveAttendanceRequestValidator()
    {
        RuleFor(x => x.ClassId).GreaterThan(0);
        RuleFor(x => x.SessionNumber).GreaterThan(0);
        RuleFor(x => x.Entries).NotEmpty();
        RuleForEach(x => x.Entries).ChildRules(entry =>
        {
            entry.RuleFor(e => e.EnrollmentId).GreaterThan(0);
            entry.RuleFor(e => e.Note).MaximumLength(250);
        });
        RuleFor(x => x.Entries)
            .Must(entries => entries.Select(e => e.EnrollmentId).Distinct().Count() == entries.Count)
            .WithErrorCode("attendance.duplicateEntry");
    }
}
