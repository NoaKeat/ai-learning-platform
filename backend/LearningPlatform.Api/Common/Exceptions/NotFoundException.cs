using System.Net;

namespace LearningPlatform.Api.Common.Exceptions;

public sealed class NotFoundException : ApiException
{
    public NotFoundException(string code, string message, object? details = null)
        : base(HttpStatusCode.NotFound, code, message, details) { }

    public static NotFoundException User(int userId) =>
        new("USER_NOT_FOUND", $"UserId {userId} not found", new { userId });

    public static NotFoundException Category(int categoryId) =>
        new("CATEGORY_NOT_FOUND", $"CategoryId {categoryId} not found", new { categoryId });

    public static NotFoundException SubCategory(int subCategoryId) =>
        new("SUBCATEGORY_NOT_FOUND", $"SubCategoryId {subCategoryId} not found", new { subCategoryId });
}
