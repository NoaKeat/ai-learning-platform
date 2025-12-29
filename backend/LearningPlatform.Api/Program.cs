using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using LearningPlatform.Api.Data;
using Microsoft.AspNetCore.Mvc;
using LearningPlatform.Api.Services;
using LearningPlatform.Api.Common.Filters;

// ✅ הוסיפי את זה לפי הניימספייס המדויק שלך:
using LearningPlatform.Api.Common.Middleware; // אם המידלוור נמצא שם

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPromptService, PromptService>();

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
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = false;
});

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

// אם יש DB_HOST => אנחנו בדוקר/קומפוז, אז ENV קודם
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
    // fallback מקומי אם אין כלום
    connectionString = "Server=localhost;Port=3306;Database=learning_platform;User=root;Password=;";
}

// EF Core MySQL (בלי AutoDetect)
var serverVersion = new MySqlServerVersion(new Version(8, 0, 0));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, serverVersion,
        mySql => mySql.EnableRetryOnFailure())
);

var app = builder.Build();

//
// ✅ 1) Exception middleware הכי מוקדם שאפשר (אחרי Build)
//
app.UseMiddleware<ExceptionHandlingMiddleware>();

//
// ✅ 2) Auto migrate + seed on startup
// (זה לא חלק מה־HTTP pipeline, אבל נשאר בסדר כאן)
//
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
