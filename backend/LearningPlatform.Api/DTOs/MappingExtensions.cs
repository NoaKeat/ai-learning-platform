namespace LearningPlatform.Api.DTOs;

using LearningPlatform.Api.Models;

public static class MappingExtensions
{
    public static UserResponse ToResponse(this User u) => new()
    {
        Id = u.Id,
        Name = u.Name,
        Phone = u.Phone
    };

public static PromptResponse ToResponse(this Prompt p) => new()
{
    Id = p.Id,
    UserId = p.UserId,
    CategoryId = p.CategoryId,
    SubCategoryId = p.SubCategoryId,
    Prompt = p.Input,
  // ✅ כך
    Response = p.Response,
    CreatedAt = p.CreatedAt
};

}
    
