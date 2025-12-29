using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace LearningPlatform.Api.Services;

public class OpenAiService : IAiService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _cfg;

    public OpenAiService(HttpClient http, IConfiguration cfg)
    {
        _http = http;
        _cfg = cfg;
    }

    public async Task<string> GenerateLessonAsync(string topic, string prompt)
    {
        var apiKey = _cfg["OpenAI:ApiKey"] ?? Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Missing OpenAI API key. Set OpenAI:ApiKey or OPENAI_API_KEY.");

        var model = _cfg["OpenAI:Model"] ?? "gpt-4o-mini";

        var payload = new
        {
            model,
            messages = new object[]
            {
                new {
                    role = "system",
                    content =
                        "את/ה מורה פרטי/ת. החזר/י תשובה בעברית בלבד. " +
                        "תני הסבר מסודר כמו שיעור: כותרת, הסבר קצר, נקודות עיקריות, דוגמה, ושאלון קצר בסוף."
                },
                new {
                    role = "user",
                    content = $"נושא: {topic}\nבקשת המשתמש: {prompt}\n\nצור/י שיעור:"
                }
            },
            temperature = 0.7
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions");
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var res = await _http.SendAsync(req);
        var body = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new InvalidOperationException($"OpenAI call failed: {(int)res.StatusCode} - {body}");

        using var doc = JsonDocument.Parse(body);
        var content = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

        return content ?? "";
    }
}
