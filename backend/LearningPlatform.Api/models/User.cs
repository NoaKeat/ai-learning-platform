namespace LearningPlatform.Api.Models;

public class User
{
    public int Id { get; set; }               
    public string Name { get; set; }     = string.Empty;     
    public string Phone { get; set; }    = string.Empty;      
    public ICollection<Prompt> Prompts { get; set; }   = new List<Prompt>();
}

