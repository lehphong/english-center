using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.Domain.Entities;

public class Enrollment : AuditableEntity
{
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int ClassId { get; set; }
    public CourseClass Class { get; set; } = null!;
    public DateOnly EnrolledOn { get; set; }
    public decimal TuitionFee { get; set; }
    public decimal AmountPaid { get; set; }
    public LearningStatus LearningStatus { get; set; } = LearningStatus.Studying;

    public ICollection<AttendanceRecord> AttendanceRecords { get; } = new List<AttendanceRecord>();
    public ICollection<Grade> Grades { get; } = new List<Grade>();

    public decimal Balance => Math.Max(TuitionFee - AmountPaid, 0);

    public PaymentStatus PaymentStatus => GetPaymentStatus(TuitionFee, AmountPaid);

    public static PaymentStatus GetPaymentStatus(decimal tuitionFee, decimal amountPaid) => amountPaid >= tuitionFee
        ? PaymentStatus.Paid
        : amountPaid > 0 ? PaymentStatus.Partial : PaymentStatus.Unpaid;
}
