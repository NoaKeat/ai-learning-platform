using LearningPlatform.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;
    public HealthController(AppDbContext db) => _db = db;

    [HttpGet("db")]
    public async Task<IActionResult> CheckDb()
    {
        var canConnect = await _db.Database.CanConnectAsync();
        return Ok(new { db = canConnect ? "OK" : "FAIL" });
    }
}
