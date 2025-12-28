using LearningPlatform.Api.Data;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Services;

public class PromptService : IPromptService
{
    private readonly AppDbContext _db;

    public PromptService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PromptResponse> CreatePromptAsync(PromptCreateRequest dto)
    {
        // 1) בדיקות קיום
        var userExists = await _db.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists) throw new KeyNotFoundException("User not found");

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) throw new KeyNotFoundException("Category not found");

        var sub = await _db.SubCategories.FirstOrDefaultAsync(sc => sc.Id == dto.SubCategoryId);
        if (sub == null) throw new KeyNotFoundException("SubCategory not found");

        // 2) בדיקה ש־SubCategory שייך ל־Category
        if (sub.CategoryId != dto.CategoryId)
            throw new InvalidOperationException("SubCategory does not belong to the selected Category");

        // 3) MOCK Response (מחר מחליפים ב-OpenAI)
        var mockResponse =
            $"(MOCK) Lesson for '{dto.Prompt}' in {dto.CategoryId}/{dto.SubCategoryId}: " +
            "Here is a short explanation + key points + a mini quiz.";

        var entity = new Prompt
        {
            UserId = dto.UserId,
            CategoryId = dto.CategoryId,
            SubCategoryId = dto.SubCategoryId,
            Input = dto.Prompt,
            Response = mockResponse,
            CreatedAt = DateTime.UtcNow
        };

        _db.Prompts.Add(entity);
        await _db.SaveChangesAsync();

        return new PromptResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            CategoryId = entity.CategoryId,
            SubCategoryId = entity.SubCategoryId,
            Prompt = entity.Input,
            Response = entity.Response,
            CreatedAt = entity.CreatedAt
        };
    }

    public async Task<List<PromptResponse>> GetUserHistoryAsync(int userId)
    {
        // אופציונלי: לוודא שהמשתמש קיים
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists) throw new KeyNotFoundException("User not found");

        return await _db.Prompts
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PromptResponse
            {
                Id = p.Id,
                UserId = p.UserId,
                CategoryId = p.CategoryId,
                SubCategoryId = p.SubCategoryId,
                Prompt = p.Input,
                Response = p.Response,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();
    }
}
