namespace LearningPlatform.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }          // שם הקטגוריה
    public ICollection<SubCategory> SubCategories { get; set; } // הקטגוריות המשניות תחת הקטגוריה הזו
}
