# .NET Core API Project Structure

## Overview

The PetLink backend is built using .NET 9.0 and ASP.NET Core Web API. It follows modern .NET practices with minimal APIs, dependency injection, and JWT-based authentication.

## Project Structure

```
PetLink.API/
├── Program.cs                    # Application entry point and configuration
├── PetLink.API.csproj           # Project file with dependencies
├── appsettings.json             # Application configuration
├── appsettings.Development.json # Development-specific settings
├── Controllers/                 # API endpoint controllers
│   ├── AuthController.cs        # Authentication endpoints
│   └── PetsController.cs        # Pet management endpoints
├── Services/                    # Business logic implementation
│   ├── AuthService.cs           # Authentication business logic
│   └── PetService.cs           # Pet management business logic
├── Interfaces/                  # Service contracts and abstractions
│   ├── IAuthService.cs         # Authentication service interface
│   └── IPetService.cs          # Pet service interface
├── Models/                      # Data transfer objects and entities
│   ├── Pet.cs                  # Pet entity model
│   └── AuthModels.cs           # Authentication DTOs
├── Properties/
│   └── launchSettings.json      # Development server configuration
├── bin/                         # Compiled output
└── obj/                         # Build artifacts
```

## Project File Analysis

### PetLink.API.csproj

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.0" />
  </ItemGroup>

</Project>
```

**Key Features**:

- **SDK**: `Microsoft.NET.Sdk.Web` - Web application template
- **Target Framework**: `.NET 9.0` - Latest LTS version
- **Nullable**: Enabled for better null safety
- **Implicit Usings**: Reduces boilerplate using statements

### Package Dependencies

#### Microsoft.AspNetCore.Authentication.JwtBearer

**Purpose**: JWT token authentication middleware

**Features**:

- JWT token validation
- Bearer token authentication scheme
- Integration with ASP.NET Core identity system

#### Microsoft.AspNetCore.OpenApi

**Purpose**: API documentation and testing

**Features**:

- Swagger/OpenAPI integration
- Automatic API documentation generation
- Interactive API testing interface

## Program.cs - Application Configuration

The main entry point that configures services and the request pipeline.

```csharp
using Microsoft.IdentityModel.Tokens;
using PetLink.API.Interfaces;
using PetLink.API.Services;

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

// Register business services
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IAuthService, AuthService>();

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

### Configuration Analysis

#### Builder Pattern

```csharp
var builder = WebApplication.CreateBuilder(args);
```

**Purpose**: Creates application builder with default configuration

**Features**:

- Configures logging, configuration, and dependency injection
- Sets up default web host settings
- Enables configuration from multiple sources

#### Service Registration

```csharp
builder.Services.AddAuthentication("Bearer")
builder.Services.AddScoped<IPetService, PetService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddControllers();
builder.Services.AddAuthorization();
```

**Dependency Injection Container**:

- **AddAuthentication**: Registers authentication services
- **AddScoped**: Registers business services with per-request lifetime
- **AddControllers**: Enables MVC controller support
- **AddAuthorization**: Adds authorization policy services

#### Request Pipeline

```csharp
app.UseCors("LocalhostPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

**Request Processing Order**:

1. **CORS**: Cross-origin request handling
2. **Authentication**: JWT token validation
3. **Authorization**: Permission checking
4. **Controllers**: Route to appropriate endpoints

## Controllers Directory

### API Controller Architecture

Controllers handle HTTP requests and implement business logic endpoints.

**Base Controller Features**:

- `[ApiController]` attribute for automatic model validation
- `[Route]` attribute for URL routing configuration
- Dependency injection for services
- Action methods for HTTP verbs (GET, POST, PUT, DELETE)

### RESTful Design Patterns

**URL Structure**:

- `/auth/login` - Authentication endpoint
- `/api/pets` - Pet resource collection
- RESTful HTTP verb usage

**Response Patterns**:

- Consistent JSON responses
- HTTP status codes (200, 401, 404, etc.)
- Error handling and validation

## Configuration Management

### appsettings.json

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

### appsettings.Development.json

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

**Configuration Hierarchy**:

1. appsettings.json (base configuration)
2. appsettings.{Environment}.json (environment-specific)
3. Environment variables
4. Command line arguments

## Development Environment

### launchSettings.json

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "applicationUrl": "http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

**Development Features**:

- **Hot Reload**: Automatic code recompilation
- **Development Exception Page**: Detailed error information
- **Swagger UI**: Interactive API documentation
- **CORS**: Enabled for frontend development

## Build Output Structure

### bin Directory

Contains compiled assemblies and dependencies:

- **PetLink.API.dll**: Main application assembly
- **PetLink.API.exe**: Executable entry point
- **Dependencies**: Third-party libraries and .NET runtime components

### obj Directory

Contains intermediate build files:

- **Compilation cache**: Faster incremental builds
- **NuGet packages**: Dependency resolution information
- **Assembly metadata**: Compilation artifacts

## .NET 9.0 Features Used

### Minimal API Support

- Simplified Program.cs configuration
- Reduced boilerplate code
- Performance optimizations

### Native AOT Ready

- Trimming-friendly dependencies
- Reduced runtime footprint
- Faster startup times

### Enhanced Performance

- Improved HTTP performance
- Better memory management
- Optimized JSON serialization

## Architecture Patterns

### Service Layer Pattern

**Business Logic Separation**:

- Controllers handle HTTP requests/responses only
- Services contain business logic and data operations
- Interfaces define contracts for service implementations
- Dependency injection manages service lifetimes

### Dependency Injection

**Built-in Container**:

- Service registration in Program.cs
- Constructor injection in controllers and services
- Lifetime management (Singleton, Scoped, Transient)
- Interface-based dependencies for testability

### Middleware Pipeline

**Request/Response Processing**:

- Ordered middleware execution
- Cross-cutting concerns (CORS, Auth, Logging)
- Custom middleware support

## Service Layer Implementation

### Business Services

The application implements a clean service layer architecture:

- **IPetService/PetService**: Pet management business logic
- **IAuthService/AuthService**: Authentication and JWT token generation
- **Dependency Injection**: Services registered as scoped dependencies
- **Controller Integration**: Controllers depend on service interfaces

### Models and DTOs

- **Pet.cs**: Core pet entity with properties (Id, Name, Type, Adopted)
- **AuthModels.cs**: Authentication data transfer objects (LoginRequest, LoginResponse, User)
- **Type Safety**: Strong typing throughout the application

## Security Implementation

### JWT Authentication

- Token-based authentication
- Stateless security model
- Bearer token scheme
- Service-based token generation

### CORS Configuration

- Cross-origin request support
- Specific origin allowlists
- Credential support for authenticated requests

## Best Practices Implemented

1. **Separation of Concerns**: Controllers handle HTTP, services handle business logic
2. **Interface Segregation**: Service contracts defined through interfaces  
3. **Dependency Injection**: Loose coupling through constructor injection
4. **Configuration Management**: Environment-specific settings
5. **Security First**: Authentication and authorization middleware
6. **RESTful Design**: Standard HTTP patterns and status codes
7. **Error Handling**: Structured error responses with proper HTTP status codes

## Next Steps

- [Authentication and JWT](./02-authentication-jwt.md)
- [Controllers and Endpoints](./03-controllers-endpoints.md)
- [Service Layer Architecture](./06-service-layer-architecture.md)
