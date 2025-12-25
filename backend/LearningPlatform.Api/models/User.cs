namespace LearningPlatform.Api.Models;

public class User
{
    public int Id { get; set; }               // מזהה ייחודי
    public string Name { get; set; }          // שם משתמש
    public string Phone { get; set; }         // טלפון
    public ICollection<Prompt> Prompts { get; set; }  // כל ההיסטוריה של הפקודות שהמשתמש שלח
}
