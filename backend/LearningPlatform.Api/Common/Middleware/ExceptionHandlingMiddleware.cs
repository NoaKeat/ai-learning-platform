using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;                 // ✅ הוספתי (HttpContext, RequestDelegate)
using Microsoft.Extensions.Hosting;              // ✅ הוספתי (IHostEnvironment)
using LearningPlatform.Api.Common.Exceptions;

namespace LearningPlatform.Api.Common.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env;      // ✅ הוספתי כדי לדעת Dev/Prod

    public ExceptionHandlingMiddleware(RequestDelegate next, IHostEnvironment env)
    {
        _next = next;
        _env = env;
    }

    public async Task Invoke(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            // ✅ אם כבר התחילו לשלוח תשובה (headers/body) אי אפשר “להחליף” ל-JSON
            if (ctx.Response.HasStarted)
                throw;

            if (ex is ApiException apiEx)
            {
                await Write(ctx, apiEx.StatusCode, apiEx.Code, apiEx.Message, apiEx.Details);
                return;
            }

            // ✅ Dev: תני לעצמך קצת יותר מידע (לריאקט זה עדיין אחיד)
            // ✅ Prod: הודעה כללית בלי לחשוף פרטים
            var details = _env.IsDevelopment()
                ? new { exception = ex.GetType().Name, message = ex.Message }
                : null;

            await Write(ctx, HttpStatusCode.InternalServerError,
                "INTERNAL_ERROR",
                "An unexpected error occurred.",
                details);
        }
    }

    private static async Task Write(HttpContext ctx, HttpStatusCode status, string code, string message, object? details)
    {
        ctx.Response.Clear();                    // ✅ מנקה headers/body שנכתבו חלקית
        ctx.Response.ContentType = "application/json";
        ctx.Response.StatusCode = (int)status;

        var payload = new
        {
            error = new
            {
                code,
                message,
                details,
                traceId = ctx.TraceIdentifier
            }
        };

        var json = JsonSerializer.Serialize(payload);
        await ctx.Response.WriteAsync(json);
    }
}
