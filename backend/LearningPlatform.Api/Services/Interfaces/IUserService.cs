namespace LearningPlatform.Api.Services;

using LearningPlatform.Api.DTOs;

public interface IUserService
{
    Task<UserResponse> RegisterUserAsync(UserRegisterRequest dto);
    Task<UserResponse?> GetUserByIdAsync(int id);
    Task<UserResponse> LoginUserAsync(UserLoginRequest dto);
}

