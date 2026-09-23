using EnglishCenter.Application.Features.Attendance;
using EnglishCenter.Application.Features.Classes;
using EnglishCenter.Application.Features.Courses;
using EnglishCenter.Application.Features.Grades;
using EnglishCenter.Domain.Common;
using EnglishCenter.Domain.Enums;
using EnglishCenter.UnitTests.TestSupport;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace EnglishCenter.UnitTests.Application;

public sealed class GradeServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();

    public void Dispose() => _db.Dispose();

    private GradeService CreateService() => new(_db.CreateContext(), new SaveGradeSheetRequestValidator());

    [Fact]
    public async Task SaveSheet_Ielts_CalculatesOverallBand()
    {
        var courseClass = _db.AddClass(_db.AddCourse(GradingScheme.Ielts));
        var enrollment = _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);

        var sheet = await CreateService().SaveSheetAsync(new SaveGradeSheetRequest(courseClass.Id, ExamType.Midterm,
            [new GradeEntry(enrollment.Id, 6, 6.5m, 6.5m, 6.5m, "Tốt")]), CancellationToken.None);

        var row = Assert.Single(sheet.Rows);
        Assert.Equal(6.5m, row.Overall);
        Assert.Equal("Tốt", row.Feedback);
    }

    [Fact]
    public async Task SaveSheet_ScoreOutsideSchemeRange_FailsWithFieldPath()
    {
        var courseClass = _db.AddClass(_db.AddCourse(GradingScheme.Ielts));
        var enrollment = _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);

        var error = await Assert.ThrowsAsync<ValidationException>(() => CreateService().SaveSheetAsync(
            new SaveGradeSheetRequest(courseClass.Id, ExamType.Midterm, [new GradeEntry(enrollment.Id, 9.5m, null, null, null, null)]),
            CancellationToken.None));

        var failure = Assert.Single(error.Errors);
        Assert.Equal("Entries[0].Listening", failure.PropertyName);
        Assert.Equal("grade.scoreOutOfRange", failure.ErrorCode);
    }

    [Fact]
    public async Task SaveSheet_EmptyEntry_RemovesExistingGrade()
    {
        var courseClass = _db.AddClass(_db.AddCourse());
        var enrollment = _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);
        await CreateService().SaveSheetAsync(new SaveGradeSheetRequest(courseClass.Id, ExamType.Final,
            [new GradeEntry(enrollment.Id, 8, null, null, null, null)]), CancellationToken.None);

        await CreateService().SaveSheetAsync(new SaveGradeSheetRequest(courseClass.Id, ExamType.Final,
            [new GradeEntry(enrollment.Id, null, null, null, null, " ")]), CancellationToken.None);

        await using var db = _db.CreateContext();
        Assert.False(await db.Grades.AnyAsync());
    }

    [Fact]
    public async Task SaveSheet_EnrollmentFromAnotherClass_IsRejected()
    {
        var course = _db.AddCourse();
        var classA = _db.AddClass(course);
        var otherEnrollment = _db.AddEnrollment(_db.AddStudent("HV1"), _db.AddClass(course));

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().SaveSheetAsync(
            new SaveGradeSheetRequest(classA.Id, ExamType.Final, [new GradeEntry(otherEnrollment.Id, 8, null, null, null, null)]),
            CancellationToken.None));

        Assert.Equal("grade.enrollmentNotInClass", error.Code);
    }
}

public sealed class AttendanceServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();

    public void Dispose() => _db.Dispose();

    private AttendanceService CreateService() => new(_db.CreateContext(), new SaveAttendanceRequestValidator());

    [Fact]
    public async Task SaveSheet_SecondSaveUpdatesInsteadOfDuplicating()
    {
        var courseClass = _db.AddClass(_db.AddCourse());
        var enrollment = _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);
        var date = new DateOnly(2026, 9, 2);

        await CreateService().SaveSheetAsync(new SaveAttendanceRequest(courseClass.Id, 1, date,
            [new AttendanceEntry(enrollment.Id, true, null)]), CancellationToken.None);
        var sheet = await CreateService().SaveSheetAsync(new SaveAttendanceRequest(courseClass.Id, 1, date,
            [new AttendanceEntry(enrollment.Id, false, "Ốm")]), CancellationToken.None);

        var row = Assert.Single(sheet.Rows);
        Assert.False(row.IsPresent);
        Assert.Equal("Ốm", row.Note);
        await using var db = _db.CreateContext();
        Assert.Equal(1, await db.AttendanceRecords.CountAsync());
    }

    [Fact]
    public async Task GetSheet_SessionBeyondCourseLength_IsRejected()
    {
        var courseClass = _db.AddClass(_db.AddCourse(sessions: 10));

        var error = await Assert.ThrowsAsync<DomainException>(() => CreateService().GetSheetAsync(courseClass.Id, 11, CancellationToken.None));

        Assert.Equal("attendance.invalidSession", error.Code);
    }

    [Fact]
    public async Task GetSheet_ListsStudyingStudentsOnly()
    {
        var courseClass = _db.AddClass(_db.AddCourse());
        _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);
        _db.AddEnrollment(_db.AddStudent("HV2"), courseClass, LearningStatus.Withdrawn);

        var sheet = await CreateService().GetSheetAsync(courseClass.Id, 1, CancellationToken.None);

        Assert.Equal("HV1", Assert.Single(sheet.Rows).StudentCode);
        Assert.Null(sheet.Rows[0].IsPresent);
    }
}

public sealed class ClassAndCourseServiceTests : IDisposable
{
    private readonly TestDatabase _db = new();

    public void Dispose() => _db.Dispose();

    private static SaveClassRequest ClassRequest(int courseId, string code = "ielts-01", int capacity = 10) =>
        new(code, "IELTS tối", courseId, null, null, null, new DateOnly(2026, 10, 1), null, capacity);

    [Fact]
    public async Task CreateClass_DuplicateCodeIgnoringCase_ThrowsConflict()
    {
        var course = _db.AddCourse();
        var service = new ClassService(_db.CreateContext(), new SaveClassRequestValidator());
        await service.CreateAsync(ClassRequest(course.Id, "IELTS-01"), CancellationToken.None);

        var error = await Assert.ThrowsAsync<EnglishCenter.Application.Common.Exceptions.ConflictException>(() =>
            new ClassService(_db.CreateContext(), new SaveClassRequestValidator())
                .CreateAsync(ClassRequest(course.Id, "ielts-01"), CancellationToken.None));

        Assert.Equal("class.duplicateCode", error.Code);
    }

    [Fact]
    public async Task UpdateClass_CapacityBelowEnrolledStudents_IsRejected()
    {
        var course = _db.AddCourse();
        var courseClass = _db.AddClass(course, maxCapacity: 5, code: "A-01");
        _db.AddEnrollment(_db.AddStudent("HV1"), courseClass);
        _db.AddEnrollment(_db.AddStudent("HV2"), courseClass);

        var error = await Assert.ThrowsAsync<DomainException>(() =>
            new ClassService(_db.CreateContext(), new SaveClassRequestValidator())
                .UpdateAsync(courseClass.Id, ClassRequest(course.Id, "A-01", capacity: 1), CancellationToken.None));

        Assert.Equal("class.capacityBelowEnrolled", error.Code);
    }

    [Fact]
    public async Task DeleteCourse_WithClasses_IsRejected()
    {
        var course = _db.AddCourse();
        _db.AddClass(course);
        var service = new CourseService(_db.CreateContext(), new FakeFileStorage(), new SaveCourseRequestValidator(),
            new EnglishCenter.Application.Common.ImageUploadValidator());

        var error = await Assert.ThrowsAsync<DomainException>(() => service.DeleteAsync(course.Id, CancellationToken.None));

        Assert.Equal("course.hasClasses", error.Code);
    }
}
