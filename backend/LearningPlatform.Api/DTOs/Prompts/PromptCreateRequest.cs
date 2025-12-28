namespace LearningPlatform.Api.DTOs;

using System.ComponentModel.DataAnnotations;

public class PromptCreateRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public int SubCategoryId { get; set; }

    [Required]
    [MinLength(5)]
    public string Prompt { get; set; } = string.Empty;
}
