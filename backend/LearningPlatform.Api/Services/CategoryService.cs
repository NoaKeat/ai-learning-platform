using LearningPlatform.Api.Data;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db)
    {
        _db = db;
    }

    // GET כל הקטגוריות כולל תתי-קטגוריות
    public async Task<List<CategoryResponse>> GetAllAsync()
    {
        return await _db.Categories
            .Include(c => c.SubCategories)
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                SubCategories = c.SubCategories
                    .Select(sc => new SubCategoryResponse
                    {
                        Id = sc.Id,
                        Name = sc.Name
                    })
                    .ToList()
            })
            .ToListAsync();
    }

    // GET לפי שם קטגוריה
    public async Task<CategoryResponse?> GetByNameAsync(string name)
    {
        var category = await _db.Categories
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Name == name);

        if (category == null)
            return null;

        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            SubCategories = category.SubCategories
                .Select(sc => new SubCategoryResponse
                {
                    Id = sc.Id,
                    Name = sc.Name
                })
                .ToList()
        };
    }
}
