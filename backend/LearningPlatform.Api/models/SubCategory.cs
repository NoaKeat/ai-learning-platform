
namespace LearningPlatform.Api.Models;
public class SubCategory
{
    public int Id { get; set; }
    public string Name { get; set; }           // שם הקטגוריה המשנית
    public int CategoryId { get; set; }        // מזהה הקטגוריה הראשית
    public Category Category { get; set; }     // קשר חזרה לקטגוריה
    public ICollection<Prompt> Prompts { get; set; } // כל הפקודות שמשויכות לתת-הקטגוריה הזו
}
