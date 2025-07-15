# Configuration and Startup

## Overview

The PetLink API uses .NET 9.0's minimal hosting model with streamlined configuration in `Program.cs`. This approach combines service registration, middleware configuration, and application startup into a single, maintainable file.

## Program.cs Architecture

### Modern .NET Application Bootstrap

The application uses the minimal hosting model introduced in .NET 6 and enhanced in subsequent versions.

```csharp
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var key = "this is my custom Secret key for authentication"; // For demo only

// Service Configuration
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

builder.Services.AddControllers();
builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

// CORS Configuration
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

// Request Pipeline Configuration
app.UseCors("LocalhostPolicy");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## Application Builder Pattern

### WebApplication.CreateBuilder()

```csharp
var builder = WebApplication.CreateBuilder(args);
```

**Purpose**: Creates application builder with default configuration

**Features Included**:

- **Configuration System**: appsettings.json, environment variables, command line
- **Logging Framework**: Console and debug logging
- **Dependency Injection**: Built-in IoC container
- **Web Host**: HTTP server configuration

**Configuration Sources** (in order of precedence):

1. Command line arguments
2. Environment variables
3. appsettings.{Environment}.json
4. appsettings.json
5. Default values

## Service Registration

### Dependency Injection Configuration

Services are registered in the builder phase before application creation.

#### Authentication Services

```csharp
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options => { /* JWT configuration */ });
```

**AddAuthentication**: Registers authentication services

**Default Scheme**: "Bearer" for JWT token authentication

**Fluent Configuration**: Chained configuration methods

#### Controller Services

```csharp
builder.Services.AddControllers();
```

**Purpose**: Registers MVC controller services

**Features Enabled**:

- Model binding and validation
- Action filters
- Result formatting
- API controller conventions

#### Authorization Services

```csharp
builder.Services.AddAuthorization();
```

**Purpose**: Registers authorization policy services

**Integration**: Works with authentication for access control

**Policy Support**: Enables role-based and policy-based authorization

#### OpenAPI Services

```csharp
builder.Services.AddOpenApi();
```

**Purpose**: Registers Swagger/OpenAPI documentation services

**Development Tool**: API documentation and testing interface

**Automatic Generation**: Creates API docs from controller metadata

### CORS Service Configuration

```csharp
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
```

**Named Policy**: "LocalhostPolicy" for specific configuration

**Origin Restrictions**: Limited to Angular dev server

**Method/Header Permissions**: Unrestricted for development

## Application Creation and Configuration

### Application Builder

```csharp
var app = builder.Build();
```

**Purpose**: Creates WebApplication instance from builder configuration

**Result**: Configured application ready for middleware pipeline setup

**State Transition**: From configuration phase to runtime phase

## Middleware Pipeline

### Pipeline Order Importance

The order of middleware registration determines request processing sequence.

```csharp
app.UseCors("LocalhostPolicy");          // 1. CORS handling
if (app.Environment.IsDevelopment())     // 2. Development tools
{
    app.MapOpenApi();
}
app.UseAuthentication();                 // 3. Authentication
app.UseAuthorization();                  // 4. Authorization
app.MapControllers();                    // 5. Route to controllers
```

#### CORS Middleware

```csharp
app.UseCors("LocalhostPolicy");
```

**Position**: First in pipeline to handle preflight requests

**Function**: Processes OPTIONS requests and adds CORS headers

**Critical**: Must execute before authentication for proper functionality

#### Development Middleware

```csharp
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
```

**Environment Check**: Only active in development

**OpenAPI Endpoint**: Exposes API documentation at development URLs

**Security**: Automatically disabled in production

#### Authentication Middleware

```csharp
app.UseAuthentication();
```

**Purpose**: Validates JWT tokens and populates user identity

**Position**: Before authorization to establish user context

**Integration**: Works with JWT bearer token scheme

#### Authorization Middleware

```csharp
app.UseAuthorization();
```

**Purpose**: Enforces access control policies

**Dependency**: Requires authentication middleware to establish user identity

**Integration**: Works with [Authorize] attributes on controllers

#### Controller Mapping

```csharp
app.MapControllers();
```

**Purpose**: Maps HTTP requests to controller actions

**Position**: Final middleware to handle actual business logic

**Routing**: Uses attribute routing from controllers

## Configuration System

### Configuration Sources

The application automatically loads configuration from multiple sources:

#### appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**Base Configuration**: Default settings for all environments

**Logging**: Controls log level output

**AllowedHosts**: Security setting for host header validation

#### appsettings.Development.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

**Environment-Specific**: Overrides base configuration for development

**Automatic Loading**: Loaded when ASPNETCORE_ENVIRONMENT=Development

**Development Optimizations**: More verbose logging, debugging features

### Environment Variables

Configuration values can be overridden with environment variables:

```bash
# Example environment variable configuration
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5000
```

**Naming Convention**: Double underscore for nested configuration

```bash
Jwt__SecretKey=your-secret-key
Jwt__Issuer=your-issuer
```

### Command Line Arguments

Override configuration with command line arguments:

```bash
dotnet run --urls=http://localhost:8080
```

## Application Lifetime

### Startup Sequence

1. **Builder Creation**: WebApplication.CreateBuilder(args)
2. **Service Registration**: builder.Services.Add*()
3. **Application Creation**: builder.Build()
4. **Middleware Configuration**: app.Use*() and app.Map*()
5. **Application Start**: app.Run()

### Graceful Shutdown

```csharp
app.Run(); // Blocks until shutdown signal received
```

**Shutdown Handling**: Automatically handles SIGTERM and SIGINT

**Graceful Shutdown**: Completes in-flight requests before termination

**Resource Cleanup**: Disposes registered services properly

## Development vs Production Configuration

### Environment Detection

```csharp
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
```

**Environment Check**: Based on ASPNETCORE_ENVIRONMENT variable

**Development Features**: Additional debugging and documentation tools

**Production Security**: Removes development-only features

### Configuration Differences

**Development**:

- Detailed logging
- Exception pages
- OpenAPI documentation
- HTTP (not HTTPS)
- Relaxed CORS policies

**Production**:

- Minimal logging
- Generic error pages
- HTTPS enforcement
- Strict CORS policies
- Security headers

## Advanced Configuration Patterns

### Typed Configuration

```csharp
// Configuration class
public class JwtSettings
{
    public string SecretKey { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public int ExpirationHours { get; set; }
}

// Registration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// Usage in controller
public AuthController(IOptions<JwtSettings> jwtSettings)
{
    _jwtSettings = jwtSettings.Value;
}
```

### Custom Service Registration

```csharp
// Interface and implementation
public interface IPetService
{
    Task<IEnumerable<Pet>> GetAllAsync();
}

public class PetService : IPetService
{
    public async Task<IEnumerable<Pet>> GetAllAsync()
    {
        // Implementation
    }
}

// Registration
builder.Services.AddScoped<IPetService, PetService>();
```

### Health Checks

```csharp
builder.Services.AddHealthChecks();

app.MapHealthChecks("/health");
```

## Best Practices Implemented

### 1. Minimal Hosting Model

- Single file configuration
- Reduced boilerplate code
- Clear separation of concerns

### 2. Service Lifetime Management

- Proper dependency injection registration
- Automatic service disposal
- Memory leak prevention

### 3. Environment-Aware Configuration

- Environment-specific settings
- Feature toggling based on environment
- Security appropriate for environment

### 4. Middleware Order

- Correct middleware pipeline order
- CORS before authentication
- Authentication before authorization

### 5. Configuration Hierarchy

- Multiple configuration sources
- Precedence-based overrides
- Environment-specific customization

## Performance Considerations

### Startup Performance

- **Minimal Services**: Only register required services
- **Lazy Loading**: Services instantiated when needed
- **Native AOT Ready**: Compatible with ahead-of-time compilation

### Runtime Performance

- **Dependency Injection**: Optimized container performance
- **Middleware Pipeline**: Efficient request processing
- **Memory Management**: Automatic resource cleanup

## Next Steps

- [Development Environment Setup](../setup/development-environment.md)
- [Running the Application](../setup/running-application.md)
