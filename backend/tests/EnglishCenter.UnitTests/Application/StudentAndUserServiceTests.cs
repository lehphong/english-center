using EnglishCenter.Application.Common.Exceptions;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Students;
using EnglishCenter.Application.Features.Users;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Entities;
using EnglishCenter.Domain.Enums;
using EnglishCenter.UnitTests.TestSupport;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.UnitTests.Application;

public sealed class StudentServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();

    public void Dispose() => _db.Dispose();

    private StudentService CreateService() => new(_db.CreateContext(), new FakePasswordHasher(), new FakeFileStorage(),
        new CreateStudentRequestValidator(_db.Clock), new SaveStudentRequestValidator(_db.Clock), new EnglishCenter.Application.Common.ImageUploadValidator());

    private static CreateStudentRequest NewRequest(string code = "hv100", bool createAccount = false, string? password = null) => new()
    {
        Code = code,
        FullName = "Phạm Minh Đức",
        Email = "Duc.Pham@Example.com",
        PhoneNumber = "0911222333",
        CreateAccount = createAccount,
        Password = password
    };

    [Fact]
    public async Task Create_NormalizesCodeAndEmail()
    {
        var student = await CreateService().CreateAsync(NewRequest(), CancellationToken.None);

        Assert.Equal("HV100", student.Code);
        Assert.Equal("duc.pham@example.com", student.Email);
        Assert.Null(student.UserId);
    }

    [Fact]
    public async Task Create_WithAccount_CreatesHashedStudentLogin()
    {
        var student = await CreateService().CreateAsync(NewRequest(createAccount: true, password: "Secret123"), CancellationToken.None);

        await using var db = _db.CreateContext();
        var user = await db.Users.SingleAsync(u => u.Id == student.UserId);
        Assert.Equal("hv100", user.Username);
        Assert.Equal(UserRole.Student, user.Role);
        Assert.Equal("hashed:Secret123", user.PasswordHash);
    }

    [Fact]
    public async Task Create_WithAccountButWithoutPassword_FailsValidation()
    {
        var error = await Assert.ThrowsAsync<ValidationException>(() =>
            CreateService().CreateAsync(NewRequest(createAccount: true), CancellationToken.None));

        Assert.Contains(error.Errors, e => e.PropertyName == "Password");
    }

    [Fact]
    public async Task Create_DuplicateEmailIgnoringCase_ThrowsConflict()
    {
        await CreateService().CreateAsync(NewRequest("HV1"), CancellationToken.None);

        var error = await Assert.ThrowsAsync<ConflictException>(() => CreateService().CreateAsync(
            NewRequest("HV2") with { PhoneNumber = "0999888777" }, CancellationToken.None));

        Assert.Equal("student.duplicateEmail", error.Code);
    }

    [Fact]
    public async Task Delete_StudentWithAccount_RemovesAccountToo()
    {
        var student = await CreateService().CreateAsync(NewRequest(createAccount: true, password: "Secret123"), CancellationToken.None);

        await CreateService().DeleteAsync(student.Id, CancellationToken.None);

        await using var db = _db.CreateContext();
        Assert.False(await db.Users.AnyAsync());
        Assert.False(await db.Students.AnyAsync());
    }

    [Fact]
    public async Task Delete_StudentWithEnrollments_IsRejected()
    {
        var student = _db.AddStudent("HV1");
        _db.AddEnrollment(student, _db.AddClass(_db.AddCourse()));

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().DeleteAsync(student.Id, CancellationToken.None));

        Assert.Equal("student.hasEnrollments", error.Code);
    }

    [Fact]
    public async Task UploadAvatar_ReplacesAndDeletesPreviousFile()
    {
        var student = _db.Add(new Student
        {
            Code = "HV1", FullName = "A", Email = "a@example.com", PhoneNumber = "0900000001", AvatarUrl = "/uploads/avatars/old.png"
        });
        var storage = new FakeFileStorage();
        var service = new StudentService(_db.CreateContext(), new FakePasswordHasher(), storage,
            new CreateStudentRequestValidator(_db.Clock), new SaveStudentRequestValidator(_db.Clock),
            new EnglishCenter.Application.Common.ImageUploadValidator());

        var result = await service.UploadAvatarAsync(student.Id,
            new FileUpload(new MemoryStream([1, 2, 3]), "new.png", 3, "image/png"), CancellationToken.None);

        Assert.Equal("/uploads/avatars/new.png", result.AvatarUrl);
        Assert.Equal(["/uploads/avatars/old.png"], storage.Deleted);
    }

    [Fact]
    public async Task UploadAvatar_RejectsNonImageFile()
    {
        var student = _db.AddStudent("HV1");

        var error = await Assert.ThrowsAsync<ValidationException>(() => CreateService().UploadAvatarAsync(student.Id,
            new FileUpload(new MemoryStream([1]), "script.exe", 1, "application/octet-stream"), CancellationToken.None));

        Assert.Contains(error.Errors, e => e.ErrorCode == "file.invalidType");
    }
}

public sealed class UserServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();
    private readonly User _admin;

    public UserServiceTests() =>
        _admin = _db.Add(new User { Username = "admin", PasswordHash = "x", Role = UserRole.Admin });

    public void Dispose() => _db.Dispose();

    private UserService CreateService(int? currentUserId = null) => new(_db.CreateContext(), new FakePasswordHasher(),
        new FakeCurrentUser(currentUserId ?? _admin.Id, UserRole.Admin),
        new CreateUserRequestValidator(), new UpdateUserRequestValidator(), new ResetPasswordRequestValidator());

    [Fact]
    public async Task Create_StudentAccount_LinksStudent()
    {
        var student = _db.AddStudent("HV1");

        var user = await CreateService().CreateAsync(
            new CreateUserRequest("hv001", "Secret123", UserRole.Student, student.Id), CancellationToken.None);

        Assert.Equal(student.Id, user.StudentId);
    }

    [Fact]
    public async Task Create_StudentAccountForStudentWhoAlreadyHasOne_ThrowsConflict()
    {
        var student = _db.AddStudent("HV1");
        await CreateService().CreateAsync(new CreateUserRequest("hv001", "Secret123", UserRole.Student, student.Id), CancellationToken.None);

        var error = await Assert.ThrowsAsync<ConflictException>(() => CreateService().CreateAsync(
            new CreateUserRequest("hv001-b", "Secret123", UserRole.Student, student.Id), CancellationToken.None));

        Assert.Equal("user.studentAlreadyLinked", error.Code);
    }

    [Fact]
    public async Task Create_StudentRoleWithoutStudent_FailsValidation()
    {
        var error = await Assert.ThrowsAsync<ValidationException>(() => CreateService().CreateAsync(
            new CreateUserRequest("hv001", "Secret123", UserRole.Student, null), CancellationToken.None));

        Assert.Contains(error.Errors, e => e.ErrorCode == "user.studentRequired");
    }

    [Fact]
    public async Task Update_LockingOwnAccount_IsRejected()
    {
        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().UpdateAsync(
            _admin.Id, new UpdateUserRequest(UserRole.Admin, IsActive: false, null), CancellationToken.None));

        Assert.Equal("user.cannotModifySelf", error.Code);
    }

    [Fact]
    public async Task Update_DemotingLastActiveAdmin_IsRejected()
    {
        var staff = _db.Add(new User { Username = "staff", PasswordHash = "x", Role = UserRole.Staff });

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService(staff.Id).UpdateAsync(
            _admin.Id, new UpdateUserRequest(UserRole.Staff, true, null), CancellationToken.None));

        Assert.Equal("user.lastAdmin", error.Code);
    }

    [Fact]
    public async Task Update_ChangingStudentRoleToStaff_UnlinksStudent()
    {
        var student = _db.AddStudent("HV1");
        var user = await CreateService().CreateAsync(new CreateUserRequest("hv001", "Secret123", UserRole.Student, student.Id), CancellationToken.None);

        var updated = await CreateService().UpdateAsync(user.Id, new UpdateUserRequest(UserRole.Staff, true, null), CancellationToken.None);

        Assert.Null(updated.StudentId);
        await using var db = _db.CreateContext();
        Assert.Null((await db.Students.FindAsync(student.Id))!.UserId);
    }

    [Fact]
    public async Task Delete_KeepsStudentProfile()
    {
        var student = _db.AddStudent("HV1");
        var user = await CreateService().CreateAsync(new CreateUserRequest("hv001", "Secret123", UserRole.Student, student.Id), CancellationToken.None);

        await CreateService().DeleteAsync(user.Id, CancellationToken.None);

        await using var db = _db.CreateContext();
        Assert.NotNull(await db.Students.FindAsync(student.Id));
        Assert.Null(await db.Users.FindAsync(user.Id));
    }

    [Fact]
    public async Task ResetPassword_StoresNewHash()
    {
        await CreateService().ResetPasswordAsync(_admin.Id, new ResetPasswordRequest("NewSecret1"), CancellationToken.None);

        await using var db = _db.CreateContext();
        Assert.Equal("hashed:NewSecret1", (await db.Users.FindAsync(_admin.Id))!.PasswordHash);
    }
}
