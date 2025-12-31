using LearningPlatform.Api.DTOs;

namespace LearningPlatform.Api.Services;

public interface IAdminService
{
    Task<PagedResponse<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search);

    Task<PagedResponse<PromptResponse>> GetUserPromptsAsync(
        int userId,
        int page,
        int pageSize,
        string? search);
}
