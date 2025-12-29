using LearningPlatform.Api.DTOs;

namespace LearningPlatform.Api.Services;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetAllAsync();
    Task<CategoryResponse> GetByNameAsync(string name);

}

