using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.UnitTests.Domain;

public class EnrollmentTests
{
    [Theory]
    [InlineData(5_000_000, 0, PaymentStatus.Unpaid)]
    [InlineData(5_000_000, 1_000_000, PaymentStatus.Partial)]
    [InlineData(5_000_000, 5_000_000, PaymentStatus.Paid)]
    [InlineData(5_000_000, 6_000_000, PaymentStatus.Paid)]
    [InlineData(0, 0, PaymentStatus.Paid)] // học bổng / miễn phí
    public void PaymentStatus_FollowsAmounts(decimal fee, decimal paid, PaymentStatus expected)
    {
        var enrollment = new Enrollment { TuitionFee = fee, AmountPaid = paid };

        Assert.Equal(expected, enrollment.PaymentStatus);
    }

    [Fact]
    public void Balance_IsNeverNegative() =>
        Assert.Equal(0, new Enrollment { TuitionFee = 100, AmountPaid = 150 }.Balance);
}

public class CourseClassTests
{
    [Fact]
    public void EnsureHasSeat_WhenFull_ThrowsClassFull()
    {
        var courseClass = new CourseClass { Code = "A1", Name = "A1", MaxCapacity = 2 };

        var error = Assert.Throws<DomainException>(() => courseClass.EnsureHasSeat(2));

        Assert.Equal("class.full", error.Code);
    }

    [Fact]
    public void EnsureHasSeat_WithFreeSeat_DoesNotThrow() =>
        new CourseClass { Code = "A1", Name = "A1", MaxCapacity = 2 }.EnsureHasSeat(1);
}
