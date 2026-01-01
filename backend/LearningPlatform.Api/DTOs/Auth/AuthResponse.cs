namespace LearningPlatform.Api.DTOs;

public record AuthResponse(
    UserResponse User,
    string Token
);
