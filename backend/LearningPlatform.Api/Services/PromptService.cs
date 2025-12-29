using LearningPlatform.Api.Common.Exceptions;
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
        // 1) בדיקות קיום (לפי המשימה: userId/categoryId -> 404)
        var userExists = await _db.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            throw NotFoundException.User(dto.UserId);

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
            throw NotFoundException.Category(dto.CategoryId);

        var sub = await _db.SubCategories.FirstOrDefaultAsync(sc => sc.Id == dto.SubCategoryId);
        if (sub == null)
            throw NotFoundException.SubCategory(dto.SubCategoryId);

        // 2) בדיקה ש־SubCategory שייך ל־Category (לפי המשימה -> 400)
        if (sub.CategoryId != dto.CategoryId)
            throw BadRequestException.SubCategoryMismatch(dto.SubCategoryId, dto.CategoryId, sub.CategoryId);

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
        // אם המשתמש לא קיים -> 404 (לפי ההנחיות שלך)
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw NotFoundException.User(userId);

        return await _db.Prompts
            .AsNoTracking()
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
