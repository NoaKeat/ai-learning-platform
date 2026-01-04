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


        if (sub.CategoryId != dto.CategoryId)
            throw BadRequestException.SubCategoryMismatch(dto.SubCategoryId, dto.CategoryId, sub.CategoryId);


        var topic = $"{category.Name} > {sub.Name}";
        var aiResponse = await _ai.GenerateLessonAsync(topic, dto.Prompt);


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


        return new PromptResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            CategoryId = entity.CategoryId,
            SubCategoryId = entity.SubCategoryId,
            Prompt = entity.Input,
            Response = aiResponse,
            CreatedAt = entity.CreatedAt,


            CategoryName = category.Name,
            SubCategoryName = sub.Name
        };
    }

    public async Task<List<PromptResponse>> GetUserHistoryAsync(int userId)
    {

        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            throw NotFoundException.User(userId);


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
                CategoryName = c.Name,
                SubCategoryName = sc.Name
            };

        return await query.ToListAsync();
    }
}
