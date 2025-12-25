using Microsoft.AspNetCore.Mvc;

namespace LearningPlatform.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public string Get()
        {
            return "Hello API!";
        }
    }
}
