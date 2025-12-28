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
    public async Task<ActionResult<UserResponse>> Register(UserRegisterRequest req)
    {
        try
        {
            var user = await _users.RegisterUserAsync(req);
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponse>> GetById(int id)
    {
        var user = await _users.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }
}
