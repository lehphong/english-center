using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EnglishCenter.Application.Common.Models;
using EnglishCenter.Application.Features.Classes;
using EnglishCenter.Application.Features.Courses;
using EnglishCenter.Application.Features.Enrollments;
using EnglishCenter.Application.Features.Grades;
using EnglishCenter.Application.Features.Portal;
using EnglishCenter.Application.Features.Students;
using EnglishCenter.Domain.Enums;

namespace EnglishCenter.IntegrationTests;

public sealed class ManagementFlowTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task CourseCrud_RoundTrip()
    {
        var client = await factory.CreateClientAsync("staff");

        var create = await client.PostAsJsonAsync("/api/courses",
            new SaveCourseRequest("Business English", "Tiếng Anh thương mại", 6_000_000, 30, GradingScheme.Standard, true), Json.Options);
        var created = await create.Content.ReadFromJsonAsync<CourseDto>(Json.Options);
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        Assert.Equal($"/api/courses/{created!.Id}", create.Headers.Location!.AbsolutePath);

        var update = await client.PutAsJsonAsync($"/api/courses/{created.Id}",
            new SaveCourseRequest("Business English Pro", null, 6_500_000, 30, GradingScheme.Standard, false), Json.Options);
        var updated = await update.Content.ReadFromJsonAsync<CourseDto>(Json.Options);
        Assert.Equal("Business English Pro", updated!.Name);
        Assert.False(updated.IsActive);

        var delete = await client.DeleteAsync($"/api/courses/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/courses/{created.Id}")).StatusCode);
    }

    [Fact]
    public async Task InvalidRequest_ReturnsValidationProblemWithFieldErrors()
    {
        var client = await factory.CreateClientAsync("staff");

        var response = await client.PostAsJsonAsync("/api/courses",
            new SaveCourseRequest("", null, -1, 0, GradingScheme.Ielts, true), Json.Options);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType!.MediaType);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var errors = json.RootElement.GetProperty("errors");
        Assert.Equal("NotEmptyValidator", errors.GetProperty("name")[0].GetProperty("code").GetString());
        Assert.Equal(1, errors.GetProperty("totalSessions")[0].GetProperty("params").GetProperty("from").GetInt32());
    }

    [Fact]
    public async Task Enrollment_FullClass_Returns422WithClassFullCode()
    {
        var client = await factory.CreateClientAsync("staff");
        var courseId = (await client.GetFromJsonAsync<PagedResult<CourseDto>>("/api/courses", Json.Options))!.Items[0].Id;

        var classResponse = await client.PostAsJsonAsync("/api/classes", new SaveClassRequest(
            $"TINY-{Random.Shared.Next(1000, 9999)}", "Lớp 1 chỗ", courseId, null, null, null, new DateOnly(2026, 10, 1), null, 1), Json.Options);
        var tinyClass = await classResponse.Content.ReadFromJsonAsync<ClassDto>(Json.Options);
        var students = (await client.GetFromJsonAsync<PagedResult<StudentDto>>("/api/students", Json.Options))!.Items;

        var first = await client.PostAsJsonAsync("/api/enrollments",
            new CreateEnrollmentRequest(students[0].Id, tinyClass!.Id, null, null, 0), Json.Options);
        var second = await client.PostAsJsonAsync("/api/enrollments",
            new CreateEnrollmentRequest(students[1].Id, tinyClass.Id, null, null, 0), Json.Options);

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, second.StatusCode);
        Assert.Equal("class.full", await AuthAndAuthorizationTests.ReadCodeAsync(second));
    }

    [Fact]
    public async Task GradesEnteredByStaff_AreVisibleInStudentPortal()
    {
        var staff = await factory.CreateClientAsync("staff");
        var student = await factory.CreateClientAsync("hv001");
        var myClass = (await student.GetFromJsonAsync<List<MyClassDto>>("/api/portal/classes", Json.Options))!
            .First(c => c.ClassCode == "IELTS-2601");
        var classId = (await staff.GetFromJsonAsync<PagedResult<ClassDto>>("/api/classes?search=IELTS-2601", Json.Options))!.Items[0].Id;

        var save = await staff.PutAsJsonAsync("/api/grades/sheet", new SaveGradeSheetRequest(classId, ExamType.Final,
            [new GradeEntry(myClass.EnrollmentId, 7, 7.5m, 6.5m, 7, "Tiến bộ tốt")]), Json.Options);
        save.EnsureSuccessStatusCode();

        var grades = await student.GetFromJsonAsync<List<MyGradeDto>>("/api/portal/grades", Json.Options);
        var final = Assert.Single(grades!, g => g.ExamType == ExamType.Final);
        Assert.Equal(7m, final.Overall);
        Assert.Equal("Tiến bộ tốt", final.Feedback);
    }

    [Fact]
    public async Task StudentAvatarUpload_StoresFileAndServesIt()
    {
        var client = await factory.CreateClientAsync("staff");
        var studentId = (await client.GetFromJsonAsync<PagedResult<StudentDto>>("/api/students", Json.Options))!.Items[0].Id;
        using var form = new MultipartFormDataContent
        {
            { new ByteArrayContent([0x89, 0x50, 0x4E, 0x47]), "file", "avatar.png" }
        };

        var response = await client.PostAsync($"/api/students/{studentId}/avatar", form);
        var student = await response.Content.ReadFromJsonAsync<StudentDto>(Json.Options);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.StartsWith("/uploads/avatars/", student!.AvatarUrl);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync(student.AvatarUrl)).StatusCode);
    }
}
