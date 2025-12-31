using LearningPlatform.Api.Data;
using LearningPlatform.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace LearningPlatform.Api.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    public AdminService(AppDbContext db) => _db = db;

    public async Task<PagedResponse<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = _db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            // ✅ when numeric: search by BOTH (ID exact) OR (Phone contains)
            if (int.TryParse(search, out var id))
            {
                q = q.Where(u =>
                    u.Id == id ||
                    u.Phone.Contains(search));
            }
            else
            {
                q = q.Where(u =>
                    u.Name.Contains(search) ||
                    u.Phone.Contains(search));
            }
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(u => u.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserDto(u.Id, u.Name, u.Phone))
            .ToListAsync();

        return new PagedResponse<AdminUserDto>(items, page, pageSize, total);
    }

    public async Task<PagedResponse<PromptResponse>> GetUserPromptsAsync(
        int userId,
        int page,
        int pageSize,
        string? search)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var q = _db.Prompts
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            q = q.Where(p =>
                p.Input.Contains(search) ||
                (p.Response != null && p.Response.Contains(search)));
        }

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PromptResponse
            {
                Id = p.Id,
                UserId = p.UserId,
                CategoryId = p.CategoryId,
                SubCategoryId = p.SubCategoryId,
                Prompt = p.Input,
                Response = p.Response,
                CreatedAt = p.CreatedAt,
                CategoryName = p.Category != null ? p.Category.Name : null,
                SubCategoryName = p.SubCategory != null ? p.SubCategory.Name : null,
            })
            .ToListAsync();

        return new PagedResponse<PromptResponse>(items, page, pageSize, total);
    }
}
