using System.Threading.Tasks;

namespace LearningPlatform.Api.Services
{
    public interface IAiService
    {
        Task<string> GenerateLessonAsync(string topic, string prompt);
    }
}
