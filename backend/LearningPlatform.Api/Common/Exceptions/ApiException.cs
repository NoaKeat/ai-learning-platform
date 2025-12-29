using System.Net;

namespace LearningPlatform.Api.Common.Exceptions;

public abstract class ApiException : Exception
{
    public HttpStatusCode StatusCode { get; }
    public string Code { get; }
    public object? Details { get; }

    protected ApiException(HttpStatusCode statusCode, string code, string message, object? details = null)
        : base(message)
    {
        StatusCode = statusCode;
        Code = code;
        Details = details;
    }

    public override string ToString() =>
        $"{GetType().Name} (Status={(int)StatusCode}, Code={Code}): {Message}";
}
