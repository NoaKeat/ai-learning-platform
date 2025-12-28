
using System.ComponentModel.DataAnnotations;

namespace LearningPlatform.Api.DTOs;

public class UserRegisterRequest
{
    [Required]
    [MinLength(2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;
}