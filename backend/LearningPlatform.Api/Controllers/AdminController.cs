using LearningPlatform.Api.Common.Exceptions;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Services;
using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.Common.Security;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/admin")]
[AdminKey]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;
    public AdminController(IAdminService admin) => _admin = admin;

    // GET /api/admin/users?page=1&pageSize=10&search=...
    [HttpGet("users")]
    public async Task<ActionResult<PagedResponse<AdminUserDto>>> Users(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var result = await _admin.GetUsersAsync(page, pageSize, search);
        return Ok(result);
    }

    // ✅ GET /api/admin/users/{userId}/prompts?page=1&pageSize=10&search=...
    [HttpGet("users/{userId:int}/prompts")]
    public async Task<ActionResult<PagedResponse<PromptResponse>>> UserPrompts(
        [FromRoute] int userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        if (userId <= 0)
        {
            throw new BadRequestException(
                code: "VALIDATION_ERROR",
                message: "userId must be a positive integer.",
                details: new { userId }
            );
        }

        var result = await _admin.GetUserPromptsAsync(userId, page, pageSize, search);
        return Ok(result);
    }
}
