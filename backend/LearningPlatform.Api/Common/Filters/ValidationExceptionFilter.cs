using LearningPlatform.Api.Common.Exceptions;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LearningPlatform.Api.Common.Filters;

public class ValidationExceptionFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ModelState.IsValid) return;

        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .ToDictionary(
                x => x.Key,
                x => x.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        throw new BadRequestException(
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: errors
        );
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
