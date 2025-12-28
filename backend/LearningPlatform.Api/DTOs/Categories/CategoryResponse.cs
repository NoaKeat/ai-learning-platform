namespace LearningPlatform.Api.DTOs;

public class CategoryResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<SubCategoryResponse> SubCategories { get; set; } = new();
}
