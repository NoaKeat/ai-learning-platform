using LearningPlatform.Api.Common.Exceptions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LearningPlatform.Api.Common.Security;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminKeyAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var cfg = context.HttpContext.RequestServices
            .GetRequiredService<IConfiguration>();

        var expected =
            cfg["Admin:Key"] ??
            Environment.GetEnvironmentVariable("ADMIN_KEY");

        // 🔴 Server misconfiguration
        if (string.IsNullOrWhiteSpace(expected))
        {
            throw new ConflictException(
                code: "SERVER_MISCONFIG",
                message: "Admin key is not configured."
            );
        }

        // 🔴 Missing / invalid admin key
        if (!context.HttpContext.Request.Headers.TryGetValue("X-ADMIN-KEY", out var provided) ||
            string.IsNullOrWhiteSpace(provided) ||
            !string.Equals(provided.ToString(), expected, StringComparison.Ordinal))
        {
            throw new BadRequestException(
                code: "UNAUTHORIZED",
                message: "Missing or invalid admin key."
            );
        }

        await next();
    }
}
