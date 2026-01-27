using Microsoft.IdentityModel.Tokens;
using PetLink.API.Interfaces;
using PetLink.API.Services;
using PetLink.API.Middleware;
using PetLink.API.Filters;
using PetLink.API.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Load configuration from appsettings files (optional - will use defaults if missing)
builder.Configuration.AddJsonFile("appsettings.Validation.json", optional: true, reloadOnChange: true);

// Configure validation settings
builder.Services.Configure<ValidationSettings>(
    builder.Configuration.GetSection("ValidationSettings"));
builder.Services.Configure<ErrorMessages>(
    builder.Configuration.GetSection("ErrorMessages"));

var key = "this is my custom Secret key for authentication"; // For demo only — put this in config in real apps

// Add authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(key))
        };
    });

// Register services
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Add controllers with global filters
builder.Services.AddControllers(options =>
{
    // Add global validation filter
    options.Filters.Add<ValidateModelAttribute>();
})
.ConfigureApiBehaviorOptions(options =>
{
    // Disable default model validation behavior since we handle it globally
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddAuthorization();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalhostPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:4200")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();

// Add global exception handling middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("LocalhostPolicy");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
// app.UseHttpsRedirection();

app.Run();