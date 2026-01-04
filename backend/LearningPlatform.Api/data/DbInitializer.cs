using LearningPlatform.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext db, ILogger logger)
    {
        await db.Database.MigrateAsync();

    
        if (await db.Categories.AnyAsync())
        {
            logger.LogInformation("Seed skipped (Categories already exist).");
            return;
        }

        logger.LogInformation("Seeding Categories and SubCategories...");

        var categories = new List<Category>
        {
            new() { Name = "Science" },
            new() { Name = "Tech" },
            new() { Name = "Math" },
            new() { Name = "History" },
        };

        db.Categories.AddRange(categories);
        await db.SaveChangesAsync();

        var catByName = categories.ToDictionary(c => c.Name, c => c.Id);

        var subCategories = new List<SubCategory>
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

        db.SubCategories.AddRange(subCategories);
        await db.SaveChangesAsync();

        logger.LogInformation("Categories and SubCategories seeded successfully.");
    }
}
