using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;
    private readonly ITokenService _tokens;

    public UsersController(IUserService users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] UserRegisterRequest req)
    {
        var user = await _users.RegisterUserAsync(req);


        var token = _tokens.CreateToken(user.Id, user.Name, isAdmin: false);

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.Id },
            new AuthResponse(user, token)
        );
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] UserLoginRequest req)
    {
        var user = await _users.LoginUserAsync(req);


        var token = _tokens.CreateToken(user.Id, user.Name, isAdmin: false);

        return Ok(new AuthResponse(user, token));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> Me()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (string.IsNullOrWhiteSpace(sub) || !int.TryParse(sub, out var userId))
            return Unauthorized();

        var user = await _users.GetUserByIdAsync(userId);
        return Ok(user);
    }


    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _users.GetUserByIdAsync(id);
        return Ok(user);
    }
}
