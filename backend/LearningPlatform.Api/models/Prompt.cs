namespace LearningPlatform.Api.Models;

public class Prompt
{
    public int Id { get; set; }
    public int UserId { get; set; }            
    public User User { get; set; }             
    public int CategoryId { get; set; }        
    public Category Category { get; set; }

    public int SubCategoryId { get; set; }     
    public SubCategory SubCategory { get; set; }= null!;

    public string Input { get; set; }          
    public string Response { get; set; }       
    public DateTime CreatedAt { get; set; }    
}

