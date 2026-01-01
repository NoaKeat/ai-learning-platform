using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LearningPlatform.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config) => _config = config;

    public string CreateToken(int userId, string name, bool isAdmin = false)
    {
        var jwt = _config.GetSection("Jwt");

        var rawKey = jwt["Key"];
        if (string.IsNullOrWhiteSpace(rawKey))
            throw new InvalidOperationException("JWT configuration error: Jwt:Key is missing.");

        if (Encoding.UTF8.GetByteCount(rawKey) < 16)
            throw new InvalidOperationException("JWT configuration error: Jwt:Key must be at least 16 bytes.");

        var issuer = jwt["Issuer"];
        var audience = jwt["Audience"];
        

        // issuer/audience אפשר להשאיר null אם לא בודקים אותם ב-TokenValidationParameters,
        // אבל אם את כן בודקת - עדיף לוודא שהם קיימים:
        if (string.IsNullOrWhiteSpace(issuer))
            throw new InvalidOperationException("JWT configuration error: Jwt:Issuer is missing.");

        if (string.IsNullOrWhiteSpace(audience))
            throw new InvalidOperationException("JWT configuration error: Jwt:Audience is missing.");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new("name", name ?? string.Empty),
            new(ClaimTypes.Role, isAdmin ? "admin" : "user")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(rawKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
