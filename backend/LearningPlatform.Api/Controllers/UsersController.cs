using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Services;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users)
    {
        _users = users;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponse>> Register([FromBody] UserRegisterRequest req)
    {
        var user = await _users.RegisterUserAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserResponse>> Login([FromBody] UserLoginRequest req)
    {
        var user = await _users.LoginUserAsync(req);
        return Ok(user);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _users.GetUserByIdAsync(id); // אם לא קיים -> NotFoundException
        return Ok(user);
    }
}
