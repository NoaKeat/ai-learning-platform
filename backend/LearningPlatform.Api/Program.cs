using System.Text;
using LearningPlatform.Api.Common.Filters;
using LearningPlatform.Api.Common.Middleware;
using LearningPlatform.Api.Data;
using LearningPlatform.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var jwt = builder.Configuration.GetSection("Jwt");
var rawJwtKey = jwt["Key"];

if (string.IsNullOrWhiteSpace(rawJwtKey) || Encoding.UTF8.GetByteCount(rawJwtKey) < 16)
{
    throw new InvalidOperationException(
        "JWT configuration error: Jwt:Key is missing or too short (min 16 bytes)."
    );
}

var signingKeyBytes = Encoding.UTF8.GetBytes(rawJwtKey);


builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(signingKeyBytes),

            ClockSkew = TimeSpan.FromMinutes(2)
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Console.WriteLine("JWT AUTH FAILED: " + ctx.Exception.GetType().Name);
                Console.WriteLine(ctx.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {
                Console.WriteLine("JWT OK (token validated).");
                return Task.CompletedTask;
            }
        };

    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPromptService, PromptService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<IAiService, OpenAiService>();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationExceptionFilter>();
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "LearningPlatform.Api",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste ONLY the JWT token here (without the word 'Bearer')."
    });

    options.AddSecurityRequirement(new()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

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

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

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

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
