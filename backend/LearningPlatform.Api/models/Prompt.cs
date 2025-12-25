namespace LearningPlatform.Api.Models;

public class Prompt
{
    public int Id { get; set; }
    public int UserId { get; set; }            // מזהה המשתמש ששלח את הפקודה
    public User User { get; set; }             // קשר חזרה למשתמש

    public int CategoryId { get; set; }        // הקטגוריה של הפקודה
    public Category Category { get; set; }

    public int SubCategoryId { get; set; }     // תת-קטגוריה
    public SubCategory SubCategory { get; set; }= null!;

    public string Input { get; set; }          // הפקודה שהמשתמש שלח
    public string Response { get; set; }       // התשובה שה-AI החזיר
    public DateTime CreatedAt { get; set; }    // מתי נשלחה הפקודה
}

