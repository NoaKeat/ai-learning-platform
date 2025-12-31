using System.Net;

namespace LearningPlatform.Api.Common.Exceptions;

public sealed class ConflictException : ApiException
{
    public ConflictException(string code, string message, object? details = null)
        : base(HttpStatusCode.Conflict, code, message, details) { }

    public static ConflictException PhoneAlreadyExists(string phone) =>
        new("PHONE_ALREADY_EXISTS", "Phone already exists", new { phone });
}
