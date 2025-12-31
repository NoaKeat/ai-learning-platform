using Microsoft.EntityFrameworkCore;
using LearningPlatform.Api.Common.Exceptions;
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
    var phone = dto.Phone.Trim();
    var name = dto.Name.Trim();

    var exists = await _db.Users.AnyAsync(u => u.Phone == phone);
    if (exists)
        throw ConflictException.PhoneAlreadyExists(phone);

    var user = new User
    {
        Name = name,
        Phone = phone
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
        if (user == null)
            throw NotFoundException.User(id); // ✅ במקום להחזיר null

        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Phone
        };
    }
    public async Task<UserResponse> LoginUserAsync(UserLoginRequest dto)
    {
        var phone = dto.Phone.Trim();

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Phone == phone);

        if (user == null)
            throw new NotFoundException(
                code: "USER_NOT_FOUND",
                message: "User does not exist. Please sign up first.",
                details: new { phone }
            );

        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Phone = user.Phone
        };
    }

}
