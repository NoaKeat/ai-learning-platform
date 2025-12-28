using LearningPlatform.Api.DTOs;

namespace LearningPlatform.Api.Services;

public interface IPromptService
{
    Task<PromptResponse> CreatePromptAsync(PromptCreateRequest dto);
    Task<List<PromptResponse>> GetUserHistoryAsync(int userId);
}
