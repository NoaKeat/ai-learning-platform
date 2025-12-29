
using System.ComponentModel.DataAnnotations;

namespace LearningPlatform.Api.DTOs;

public class UserRegisterRequest
{
    [Required]
    [MinLength(2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression(
        @"^05\d{8}$",
        ErrorMessage = "Phone must be a valid Israeli number (05XXXXXXXX)"
    )]
    public string Phone { get; set; } = string.Empty;
}