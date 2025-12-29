using System.Net;

namespace LearningPlatform.Api.Common.Exceptions;

public sealed class BadRequestException : ApiException
{
    public BadRequestException(string code, string message, object? details = null)
        : base(HttpStatusCode.BadRequest, code, message, details) { }

    public static BadRequestException SubCategoryMismatch(int subCategoryId, int expectedCategoryId, int? actualCategoryId = null) =>
        new(
            "SUBCATEGORY_CATEGORY_MISMATCH",
            $"SubCategoryId {subCategoryId} does not belong to CategoryId {expectedCategoryId}",
            new { subCategoryId, expectedCategoryId, actualCategoryId }
        );
}
