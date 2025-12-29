using System;
using System.Text;
using System.Threading.Tasks;

namespace LearningPlatform.Api.Services
{
    public class MockAiService : IAiService
    {
        public Task<string> GenerateLessonAsync(string topic, string prompt)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"📘 Lesson: {topic}");
            sb.AppendLine();
            sb.AppendLine($"You asked: \"{prompt}\"");
            sb.AppendLine();
            sb.AppendLine("✅ Quick explanation:");
            sb.AppendLine($"Here’s a beginner-friendly overview of {topic} based on your prompt.");
            sb.AppendLine();
            sb.AppendLine("🧠 Key points:");
            sb.AppendLine("• Definition in simple words");
            sb.AppendLine("• Why it matters");
            sb.AppendLine("• A real-world example");
            sb.AppendLine();
            sb.AppendLine("📝 Mini practice:");
            sb.AppendLine("1) Write 2–3 sentences summarizing what you learned.");
            sb.AppendLine("2) Give one example from daily life.");
            sb.AppendLine();
            sb.AppendLine($"⏱ Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");

            return Task.FromResult(sb.ToString());
        }
    }
}
