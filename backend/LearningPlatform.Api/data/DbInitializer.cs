using LearningPlatform.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext db, ILogger logger)
    {
        // מוודאים שהמיגרציות רצות
        await db.Database.MigrateAsync();

        // Seed רק אם אין נתונים (כדי שלא יכניס כפילויות)
        if (!await db.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Science" },
                new() { Name = "Tech" },
                new() { Name = "Math" },
                new() { Name = "History" },
            };

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();

            var catByName = await db.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);

            var subs = new List<SubCategory>
            {
                new() { Name = "Space",    CategoryId = catByName["Science"] },
                new() { Name = "Biology",  CategoryId = catByName["Science"] },
                new() { Name = "AI",       CategoryId = catByName["Tech"] },
                new() { Name = "Web Dev",  CategoryId = catByName["Tech"] },
                new() { Name = "Algebra",  CategoryId = catByName["Math"] },
                new() { Name = "Calculus", CategoryId = catByName["Math"] },
                new() { Name = "Ancient",  CategoryId = catByName["History"] },
                new() { Name = "Modern",   CategoryId = catByName["History"] },
            };

            db.SubCategories.AddRange(subs);
            await db.SaveChangesAsync();

            logger.LogInformation("Seeded Categories and SubCategories.");
        }
        else
        {
            logger.LogInformation("Seed skipped (Categories already exist).");
        }
    }
}
