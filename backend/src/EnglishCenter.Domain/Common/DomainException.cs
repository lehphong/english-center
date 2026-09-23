namespace EnglishCenter.Domain.Common;

/// <summary>
/// Vi phạm quy tắc nghiệp vụ. <see cref="Code"/> là mã ổn định (vd "class.full") để frontend dịch thông báo.
/// </summary>
public class DomainException : Exception
{
    public DomainException(string code, string message) : base(message) => Code = code;

    public string Code { get; }
}
