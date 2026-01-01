namespace LearningPlatform.Api.Services;

public interface ITokenService
{
    string CreateToken(int userId, string name, bool isAdmin = false);
}
