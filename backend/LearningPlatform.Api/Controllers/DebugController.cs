using Microsoft.AspNetCore.Mvc;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/debug")]
public class DebugController : ControllerBase
{
    [HttpGet("boom")]
    public IActionResult Boom()
    {
        throw new Exception("Simulated unexpected error (debug)");
    }
}
