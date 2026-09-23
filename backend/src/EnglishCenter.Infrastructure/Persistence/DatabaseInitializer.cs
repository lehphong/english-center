using EnglishCenter.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EnglishCenter.Infrastructure.Persistence;

public enum DatabaseInitMode
{
    /// <summary>Không làm gì (production: chạy migration trong pipeline deploy).</summary>
    None,

    /// <summary>Áp dụng migration còn thiếu.</summary>
    Migrate,

    /// <summary>Tạo schema trực tiếp từ model, dùng cho database test (SQLite).</summary>
    EnsureCreated
}

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider services, IConfiguration configuration)
    {
        var mode = configuration.GetValue("Database:InitMode", DatabaseInitMode.None);
        var seed = configuration.GetValue("Database:Seed", false);

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        switch (mode)
        {
            case DatabaseInitMode.Migrate:
                await db.Database.MigrateAsync();
                break;
            case DatabaseInitMode.EnsureCreated:
                await db.Database.EnsureCreatedAsync();
                break;
        }

        if (seed)
        {
            await scope.ServiceProvider.GetRequiredService<DataSeeder>().SeedAsync();
        }
    }
}
