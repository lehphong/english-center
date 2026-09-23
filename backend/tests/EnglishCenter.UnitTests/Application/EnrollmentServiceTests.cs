using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Features.Enrollments;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using EnglishCenter.UnitTests.TestSupport;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.UnitTests.Application;

public sealed class EnrollmentServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();

    public void Dispose() => _db.Dispose();

    private EnrollmentService CreateService() =>
        new(_db.CreateContext(), _db.Clock, new CreateEnrollmentRequestValidator(), new UpdateEnrollmentRequestValidator());

    [Fact]
    public async Task Create_WithoutTuitionFee_UsesCourseFeeAndToday()
    {
        var courseClass = _db.AddClass(_db.AddCourse(fee: 7_000_000));
        var student = _db.AddStudent("HV1");

        var result = await CreateService().CreateAsync(
            new CreateEnrollmentRequest(student.Id, courseClass.Id, null, null, 2_000_000), CancellationToken.None);

        Assert.Equal(7_000_000, result.TuitionFee);
        Assert.Equal(5_000_000, result.Balance);
        Assert.Equal(PaymentStatus.Partial, result.PaymentStatus);
        Assert.Equal(new DateOnly(2026, 9, 15), result.EnrolledOn);
    }

    [Fact]
    public async Task Create_SameStudentTwice_ThrowsConflict()
    {
        var courseClass = _db.AddClass(_db.AddCourse());
        var student = _db.AddStudent("HV1");
        _db.AddEnrollment(student, courseClass);

        var error = await Assert.ThrowsAsync<ConflictException>(() => CreateService().CreateAsync(
            new CreateEnrollmentRequest(student.Id, courseClass.Id, null, null, 0), CancellationToken.None));

        Assert.Equal("enrollment.duplicate", error.Code);
    }

    [Fact]
    public async Task Create_WhenClassIsFull_ThrowsClassFull()
    {
        var courseClass = _db.AddClass(_db.AddCourse(), maxCapacity: 1);
        _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().CreateAsync(
            new CreateEnrollmentRequest(_db.AddStudent("HV2").Id, courseClass.Id, null, null, 0), CancellationToken.None));

        Assert.Equal("class.full", error.Code);
    }

    [Fact]
    public async Task Create_WithdrawnStudentsDoNotTakeSeats()
    {
        var courseClass = _db.AddClass(_db.AddCourse(), maxCapacity: 1);
        _db.AddEnrollment(_db.AddStudent("HV1"), courseClass, LearningStatus.Withdrawn);

        var result = await CreateService().CreateAsync(
            new CreateEnrollmentRequest(_db.AddStudent("HV2").Id, courseClass.Id, null, null, 0), CancellationToken.None);

        Assert.Equal(LearningStatus.Studying, result.LearningStatus);
    }

    [Fact]
    public async Task Update_ReactivatingWithdrawnStudentInFullClass_ThrowsClassFull()
    {
        var courseClass = _db.AddClass(_db.AddCourse(), maxCapacity: 1);
        var withdrawn = _db.AddEnrollment(_db.AddStudent("HV1"), courseClass, LearningStatus.Withdrawn);
        _db.AddEnrollment(_db.AddStudent("HV2"), courseClass);

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().UpdateAsync(withdrawn.Id,
            new UpdateEnrollmentRequest(5_000_000, 0, LearningStatus.Studying), CancellationToken.None));

        Assert.Equal("class.full", error.Code);
    }

    [Fact]
    public async Task Delete_WithAttendance_IsRejected()
    {
        var enrollment = _db.AddEnrollment(_db.AddStudent("HV1"), _db.AddClass(_db.AddCourse()));
        _db.Add(new AttendanceRecord { EnrollmentId = enrollment.Id, SessionNumber = 1, SessionDate = new DateOnly(2026, 9, 2) });

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().DeleteAsync(enrollment.Id, CancellationToken.None));

        Assert.Equal("enrollment.hasRecords", error.Code);
    }

    [Theory]
    [InlineData(PaymentStatus.Paid, "HV1")]
    [InlineData(PaymentStatus.Partial, "HV2")]
    [InlineData(PaymentStatus.Unpaid, "HV3")]
    public async Task GetPaged_FiltersByPaymentStatus(PaymentStatus status, string expectedStudent)
    {
        var courseClass = _db.AddClass(_db.AddCourse());
        _db.AddEnrollment(_db.AddStudent("HV1"), courseClass, fee: 100, paid: 100);
        _db.AddEnrollment(_db.AddStudent("HV2"), courseClass, fee: 100, paid: 40);
        _db.AddEnrollment(_db.AddStudent("HV3"), courseClass, fee: 100, paid: 0);

        var page = await CreateService().GetPagedAsync(new EnrollmentQuery { PaymentStatus = status }, CancellationToken.None);

        Assert.Equal(expectedStudent, Assert.Single(page.Items).StudentCode);
    }

    [Fact]
    public async Task Create_SetsAuditTimestamp()
    {
        var courseClass = _db.AddClass(_db.AddCourse());
        var created = await CreateService().CreateAsync(
            new CreateEnrollmentRequest(_db.AddStudent("HV1").Id, courseClass.Id, null, null, 0), CancellationToken.None);

        await using var db = _db.CreateContext();
        var entity = await db.Enrollments.SingleAsync(e => e.Id == created.Id);
        Assert.Equal(_db.Clock.GetUtcNow(), entity.CreatedAt);
    }
}
