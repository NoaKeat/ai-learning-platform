using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/prompts")]
public class PromptsController : ControllerBase
{
    private readonly IPromptService _prompts;

    public PromptsController(IPromptService prompts)
    {
        _prompts = prompts;
    }

    [HttpPost]
    public async Task<ActionResult<PromptResponse>> Create([FromBody] PromptCreateRequest req)
    {
        try
        {
            var result = await _prompts.CreatePromptAsync(req);
            return CreatedAtAction(nameof(GetHistory), new { userId = result.UserId }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("history/{userId:int}")]
    public async Task<ActionResult<List<PromptResponse>>> GetHistory(int userId)
    {
        try
        {
            var result = await _prompts.GetUserHistoryAsync(userId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
