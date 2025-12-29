using LearningPlatform.Api.Common.Exceptions;
using LearningPlatform.Api.Data;
using LearningPlatform.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoryResponse>> GetAllAsync()
    {
        return await _db.Categories
            .AsNoTracking()
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

    public async Task<CategoryResponse> GetByNameAsync(string name)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Name == name);

        if (category == null)
            throw new NotFoundException("CATEGORY_NOT_FOUND", $"Category '{name}' not found", new { name });

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
