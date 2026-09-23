using EnglishCenter.Application.Features.Attendance;
using EnglishCenter.Application.Features.Auth;
using EnglishCenter.Application.Features.Classes;
using EnglishCenter.Application.Features.Courses;
using EnglishCenter.Application.Features.Enrollments;
using EnglishCenter.Application.Features.Grades;
using EnglishCenter.Application.Features.Portal;
using EnglishCenter.Application.Features.Students;
using EnglishCenter.Application.Features.Users;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace EnglishCenter.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly, includeInternalTypes: true);
        services.TryAddSingleton(TimeProvider.System);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<IStudentService, StudentService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IEnrollmentService, EnrollmentService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<IGradeService, GradeService>();
        services.AddScoped<IPortalService, PortalService>();

        return services;
    }
}
