using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.Services;
using LearningPlatform.Api.DTOs;

namespace LearningPlatform.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories)
    {
        _categories = categories;
    }

   
    [HttpGet]
    public async Task<ActionResult<List<CategoryResponse>>> GetAll()
    {
        var result = await _categories.GetAllAsync();
        return Ok(result);
    }

    
    [HttpGet("by-name/{name}")]
    public async Task<ActionResult<CategoryResponse>> GetByName(string name)
    {
        var category = await _categories.GetByNameAsync(name);
        if (category == null) return NotFound();
        return Ok(category);
    }
}
