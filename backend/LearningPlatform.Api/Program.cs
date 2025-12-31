using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using LearningPlatform.Api.Data;
using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.Services;
using LearningPlatform.Api.Common.Filters;
using LearningPlatform.Api.Common.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ✅ CORS — מאפשר ל-React (5173) לגשת ל-API (8080)
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
                "http://localhost:3000", // ✅ Docker+nginx
                "http://localhost:5173"  // ✅ Vite dev (אם תריצי בלי Docker)
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});


builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPromptService, PromptService>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<IAiService, OpenAiService>();

builder.Services.AddScoped<IAdminService, AdminService>();

// Controllers
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationExceptionFilter>();
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

/*
   DB Connection logic:
   1) Prefer appsettings ConnectionStrings:DefaultConnection (local dev)
   2) Otherwise build connection from ENV vars (docker-compose)
*/
var connFromConfig = builder.Configuration.GetConnectionString("DefaultConnection");

var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPass = Environment.GetEnvironmentVariable("DB_PASSWORD");

var hasDockerEnv = !string.IsNullOrWhiteSpace(dbHost);

string connectionString;

if (hasDockerEnv)
{
    dbHost ??= "mysql";
    dbPort ??= "3306";
    dbName ??= "learning_platform";
    dbUser ??= "root";
    dbPass ??= "";

    connectionString = $"Server={dbHost};Port={dbPort};Database={dbName};User={dbUser};Password={dbPass};";
}
else if (!string.IsNullOrWhiteSpace(connFromConfig))
{
    connectionString = connFromConfig;
}
else
{
    connectionString = "Server=localhost;Port=3306;Database=learning_platform;User=root;Password=;";
}

var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, serverVersion, mySql => mySql.EnableRetryOnFailure())
);

var app = builder.Build();

// ✅ 1) Middleware לחריגות (כמו אצלך)
app.UseMiddleware<ExceptionHandlingMiddleware>();

// ✅ 2) CORS חייב להיות מוקדם, לפני MapControllers (ולפני Authorization)
app.UseCors("Frontend");

// ✅ 3) Auto migrate + seed on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
        .CreateLogger("DbInitializer");

    var retries = 10;
    while (true)
    {
        try
        {
            await DbInitializer.InitializeAsync(db, logger);
            break;
        }
        catch (Exception ex)
        {
            retries--;
            logger.LogWarning(ex, "DB not ready yet. Retries left: {retries}", retries);
            if (retries <= 0) throw;
            await Task.Delay(2000);
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.Run();
