namespace LearningPlatform.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }          // שם הקטגוריה
    public List<SubCategory> SubCategories { get; set; } = new();
}
