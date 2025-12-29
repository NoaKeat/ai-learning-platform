using LearningPlatform.Api.Common.Exceptions;
using LearningPlatform.Api.Data;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Services;

public class PromptService : IPromptService
{
    private readonly AppDbContext _db;
    private readonly IAiService _ai;

    public PromptService(AppDbContext db, IAiService ai)
    {
        _db = db;
        _ai = ai;
    }

    public async Task<PromptResponse> CreatePromptAsync(PromptCreateRequest dto)
    {
        // 1) בדיקות קיום (לפי המשימה: userId/categoryId -> 404)
        var userExists = await _db.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            throw NotFoundException.User(dto.UserId);

        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId);

        if (category == null)
            throw NotFoundException.Category(dto.CategoryId);

        var sub = await _db.SubCategories
            .AsNoTracking()
            .FirstOrDefaultAsync(sc => sc.Id == dto.SubCategoryId);

        if (sub == null)
            throw NotFoundException.SubCategory(dto.SubCategoryId);

        // 2) בדיקה ש־SubCategory שייך ל־Category (לפי המשימה -> 400)
        if (sub.CategoryId != dto.CategoryId)
            throw BadRequestException.SubCategoryMismatch(dto.SubCategoryId, dto.CategoryId, sub.CategoryId);

        // 3) AI Response (Mock/OpenAI) דרך IAiService
        var topic = $"{category.Name} > {sub.Name}";
        var aiResponse = await _ai.GenerateLessonAsync(topic, dto.Prompt);

        // 4) שמירה ל־DB
        var entity = new Prompt
        {
            UserId = dto.UserId,
            CategoryId = dto.CategoryId,
            SubCategoryId = dto.SubCategoryId,
            Input = dto.Prompt,
            Response = aiResponse,
            CreatedAt = DateTime.UtcNow
        };

        _db.Prompts.Add(entity);
        await _db.SaveChangesAsync();

        // 5) החזרת DTO (הוספתי שמות כדי ש-Create יחזיר "עשיר" כמו History)
        return new PromptResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            CategoryId = entity.CategoryId,
            SubCategoryId = entity.SubCategoryId,
            Prompt = entity.Input,
            Response = aiResponse,
            CreatedAt = entity.CreatedAt,

            // אם הוספת שדות DTO לשמות:
            CategoryName = category.Name,
            SubCategoryName = sub.Name
        };
    }

    public async Task<List<PromptResponse>> GetUserHistoryAsync(int userId)
    {
        // אם המשתמש לא קיים -> 404
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw NotFoundException.User(userId);

        // History עם שמות (join) + מיון לפי CreatedAt desc
        var query =
            from p in _db.Prompts.AsNoTracking()
            join c in _db.Categories.AsNoTracking() on p.CategoryId equals c.Id
            join sc in _db.SubCategories.AsNoTracking() on p.SubCategoryId equals sc.Id
            where p.UserId == userId
            orderby p.CreatedAt descending
            select new PromptResponse
            {
                Id = p.Id,
                UserId = p.UserId,
                CategoryId = p.CategoryId,
                SubCategoryId = p.SubCategoryId,
                Prompt = p.Input,
                Response = p.Response,
                CreatedAt = p.CreatedAt,

                // אם הוספת שדות DTO לשמות:
                CategoryName = c.Name,
                SubCategoryName = sc.Name
            };

        return await query.ToListAsync();
    }
}
