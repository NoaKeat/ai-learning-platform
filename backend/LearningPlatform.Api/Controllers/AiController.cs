using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.Services;

namespace LearningPlatform.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("test")]
        public async Task<IActionResult> Test([FromQuery] string topic, [FromQuery] string prompt)
        {
            if (string.IsNullOrWhiteSpace(topic) || string.IsNullOrWhiteSpace(prompt))
                return BadRequest(new { message = "topic and prompt are required." });

            var lesson = await _aiService.GenerateLessonAsync(topic, prompt);
            return Ok(new { topic, prompt, lesson });
        }
    }
}
