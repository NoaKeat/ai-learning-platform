namespace LearningPlatform.Api.DTOs;

public class PromptResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public int SubCategoryId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string Response { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? CategoryName { get; set; }
    public string? SubCategoryName { get; set; }

}
