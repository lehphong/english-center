namespace EnglishCenter.Api.Common;

public static class Policies
{
    /// <summary>Chỉ quản trị viên (quản lý tài khoản).</summary>
    public const string Admin = nameof(Admin);

    /// <summary>Quản trị viên và giáo vụ (các nghiệp vụ quản lý đào tạo).</summary>
    public const string Staff = nameof(Staff);

    /// <summary>Học viên (cổng tra cứu cá nhân).</summary>
    public const string Student = nameof(Student);
}
