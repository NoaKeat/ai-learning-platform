using LearningPlatform.Api.Common.Exceptions;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromptsController : ControllerBase
{
    private readonly IPromptService _promptService;

    public PromptsController(IPromptService promptService)
    {
        _promptService = promptService;
    }


    [HttpPost]
    public async Task<ActionResult<PromptResponse>> Create([FromBody] PromptCreateRequest dto)
    {
        // ה-ValidationExceptionFilter שלך יתפוס ModelState לא תקין ויזרוק BadRequestException (400) בצורה 
        var result = await _promptService.CreatePromptAsync(dto);
        return Ok(result);
    }

    // GET /api/prompts/history?userId=1
    [HttpGet("history")]
    public async Task<ActionResult<List<PromptResponse>>> History([FromQuery] int userId)
    {
        if (userId <= 0)
        {

            throw new BadRequestException(
                code: "VALIDATION_ERROR",
                message: "userId must be a positive integer.",
                details: new { userId }
            );
        }

        var items = await _promptService.GetUserHistoryAsync(userId);
        return Ok(items);
    }
}
