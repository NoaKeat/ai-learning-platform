using Microsoft.EntityFrameworkCore;
using LearningPlatform.Api.Data;
using LearningPlatform.Api.DTOs;
using LearningPlatform.Api.Models;

namespace LearningPlatform.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;

    public UserService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserResponse> RegisterUserAsync(UserRegisterRequest dto)
    {
        var exists = await _db.Users.AnyAsync(u => u.Phone == dto.Phone);
        if (exists)
            throw new InvalidOperationException("Phone already exists");

        var user = new User
        {
            Name = dto.Name.Trim(),
            Phone = dto.Phone.Trim()
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Phone
        };
    }

    public async Task<UserResponse?> GetUserByIdAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return null;

        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Phone
        };
    }
}
