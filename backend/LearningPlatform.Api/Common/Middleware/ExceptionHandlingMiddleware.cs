using System.Net;
using System.Text.Json;
using LearningPlatform.Api.Common.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace LearningPlatform.Api.Common.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IHostEnvironment _env;

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
            if (ctx.Response.HasStarted)
                throw;

            // 400 - ולידציה/טיעונים לא תקינים
            if (ex is ArgumentException argEx)
            {
                await WriteProblem(ctx, HttpStatusCode.BadRequest, "ARGUMENT_ERROR", argEx.Message, null);
                return;
            }

            // 409 - התנגשות/Constraint DB
            if (ex is DbUpdateException)
            {
                await WriteProblem(ctx, HttpStatusCode.Conflict, "DB_CONFLICT",
                    "Database constraint violation.", null);
                return;
            }

            // ApiException -> סטטוס לפי מה שהגדרת
            if (ex is ApiException apiEx)
            {
                await WriteProblem(ctx, apiEx.StatusCode, apiEx.Code, apiEx.Message, apiEx.Details);
                return;
            }

            // 500 - לא צפוי
            var devDetails = _env.IsDevelopment()
                ? new { exception = ex.GetType().Name, message = ex.Message }
                : null;

            await WriteProblem(ctx, HttpStatusCode.InternalServerError,
                "INTERNAL_ERROR",
                "An unexpected error occurred.",
                devDetails);
        }
    }

    private static async Task WriteProblem(HttpContext ctx, HttpStatusCode status, string code, string message, object? details)
    {
        ctx.Response.Clear();
        ctx.Response.StatusCode = (int)status;
        ctx.Response.ContentType = "application/problem+json";

        var problem = new ProblemDetails
        {
            Status = (int)status,
            Title = ((int)status) switch
            {
                400 => "Bad Request",
                404 => "Not Found",
                409 => "Conflict",
                500 => "Internal Server Error",
                _ => "Error"
            },
            Detail = message,
            Instance = ctx.Request.Path
        };

        problem.Extensions["code"] = code;
        problem.Extensions["details"] = details;
        problem.Extensions["traceId"] = ctx.TraceIdentifier;

        await ctx.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }
}
