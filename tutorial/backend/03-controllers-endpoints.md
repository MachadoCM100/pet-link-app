# Controllers and Endpoints

## Overview

The PetLink API uses ASP.NET Core controllers to handle HTTP requests and implement RESTful endpoints. The application includes two main controllers: `AuthController` for authentication and `PetsController` for pet data management.

## Controller Architecture

### 1. RESTful Design Patterns
### 2. HTTP Verb Mapping
### 3. Request/Response Handling
### 4. Authorization Integration

## AuthController - Authentication Endpoints

Handles user authentication and token generation.

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private const string DemoUsername = "admin";
    private const string DemoPassword = "password";
    private const string SecretKey = "this is my custom Secret key for authentication";

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        Console.WriteLine($"Login attempt: Username={request.Username}, Password={request.Password}");

        if (request.Username != DemoUsername || request.Password != DemoPassword)
            return Unauthorized();

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(SecretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, request.Username) }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key), 
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return Ok(new { token = tokenString });
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
```

### Controller Attributes

#### `[ApiController]`

**Purpose**: Enables API-specific behaviors and conventions

**Features**:

- **Automatic Model Validation**: Returns 400 Bad Request for invalid models
- **Binding Source Inference**: Automatically determines parameter sources
- **Problem Details**: Standardized error response format
- **Attribute Routing Required**: Enforces explicit route configuration

#### `[Route("auth")]`

**Purpose**: Defines the base URL path for all controller actions

**Route Structure**: `/auth` - Groups authentication-related endpoints

**Full URL**: `http://localhost:5000/auth/login`

### Action Method Analysis

#### HTTP Method Attribute

```csharp
[HttpPost("login")]
```

**Verb Selection**: POST - Appropriate for authentication requests

**Route Template**: "login" - Combined with controller route

**Security**: POST prevents credentials in URL/logs

#### Parameter Binding

```csharp
public IActionResult Login([FromBody] LoginRequest request)
```

**`[FromBody]`**: Binds request data from JSON body

**Model Binding**: Automatic JSON deserialization to LoginRequest object

**Validation**: ApiController automatically validates the model

#### Response Handling

```csharp
// Success response
return Ok(new { token = tokenString });

// Error response  
return Unauthorized();
```

**OK Result**: Returns 200 status with JSON response

**Unauthorized Result**: Returns 401 status for invalid credentials

## PetsController - Data Endpoints

Manages pet-related data operations with authorization protection.

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/pets")]
[Authorize]
public class PetsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetPets()
    {
        var pets = new[]
        {
            new { Id = 1, Name = "Fluffy", Type = "Cat", Adopted = false },
            new { Id = 2, Name = "Rover", Type = "Dog", Adopted = true }
        };
        return Ok(pets);
    }
}
```

### Authorization Protection

#### `[Authorize]` Attribute

```csharp
[Authorize]
public class PetsController : ControllerBase
```

**Scope**: Applied at controller level - protects all actions

**Effect**: Requires valid JWT token for access

**Response**: Returns 401 Unauthorized if no valid token

#### Authentication Flow

1. **Request**: Client sends request with Bearer token
2. **Middleware**: JWT middleware validates token
3. **Authorization**: [Authorize] attribute checks authentication
4. **Access**: Grants or denies access to action method

### Data Response Pattern

#### Static Data Implementation

```csharp
var pets = new[]
{
    new { Id = 1, Name = "Fluffy", Type = "Cat", Adopted = false },
    new { Id = 2, Name = "Rover", Type = "Dog", Adopted = true }
};
```

**Current Approach**: Hardcoded data for demo purposes

**Object Structure**: Anonymous objects matching frontend Pet interface

**Production Alternative**: Database queries, business logic services

#### JSON Serialization

```csharp
return Ok(pets);
```

**Automatic Serialization**: ASP.NET Core converts objects to JSON

**Content-Type**: Automatically set to `application/json`

**Status Code**: 200 OK for successful requests

## HTTP Status Code Usage

### Successful Responses

**200 OK**:

```csharp
return Ok(data);  // Successful GET, POST, PUT operations
```

**201 Created**:

```csharp
return Created($"/api/pets/{pet.Id}", pet);  // Successful POST with new resource
```

### Client Error Responses

**400 Bad Request**:

```csharp
return BadRequest("Invalid request data");  // Validation failures
```

**401 Unauthorized**:

```csharp
return Unauthorized();  // Authentication required
```

**404 Not Found**:

```csharp
return NotFound();  // Resource doesn't exist
```

### Server Error Responses

**500 Internal Server Error**:

- Automatically returned for unhandled exceptions
- Middleware handles error responses

## RESTful Endpoint Design

### Resource-Based URLs

**Authentication**:

- `POST /auth/login` - User authentication

**Pets Collection**:

- `GET /api/pets` - Retrieve all pets
- `POST /api/pets` - Create new pet
- `GET /api/pets/{id}` - Retrieve specific pet
- `PUT /api/pets/{id}` - Update specific pet
- `DELETE /api/pets/{id}` - Delete specific pet

### HTTP Verb Conventions

**GET**: Retrieve data (safe, idempotent)

**POST**: Create new resources or non-idempotent operations

**PUT**: Update entire resources (idempotent)

**PATCH**: Partial resource updates

**DELETE**: Remove resources (idempotent)

## Request/Response Patterns

### Content Negotiation

**Accept Headers**: Client specifies preferred response format

**Content-Type**: Server indicates response format

**Default Format**: JSON for API controllers

### Model Binding Sources

```csharp
// From URL route parameters
public IActionResult GetPet([FromRoute] int id)

// From query string
public IActionResult GetPets([FromQuery] string type)

// From request body
public IActionResult CreatePet([FromBody] Pet pet)

// From form data
public IActionResult Upload([FromForm] IFormFile file)

// From HTTP header
public IActionResult Process([FromHeader] string apiKey)
```

## Error Handling Patterns

### Controller-Level Error Handling

```csharp
[HttpGet("{id}")]
public IActionResult GetPet(int id)
{
    try
    {
        var pet = petService.GetById(id);
        if (pet == null)
            return NotFound();
            
        return Ok(pet);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error retrieving pet {PetId}", id);
        return StatusCode(500, "Internal server error");
    }
}
```

### Global Exception Handling

**Middleware Approach**:

```csharp
app.UseExceptionHandler("/error");
```

**Custom Exception Middleware**:

- Catches unhandled exceptions
- Logs errors
- Returns consistent error responses

## Validation Patterns

### Model Validation

```csharp
public class CreatePetRequest
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; }
    
    [Required]
    public string Type { get; set; }
    
    public bool Adopted { get; set; }
}
```

**Attributes**: Data annotations for validation rules

**Automatic Validation**: ApiController validates before action execution

**Error Response**: 400 Bad Request with validation details

### Custom Validation

```csharp
[HttpPost]
public IActionResult CreatePet([FromBody] CreatePetRequest request)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);
        
    // Additional business logic validation
    if (petService.NameExists(request.Name))
        return BadRequest("Pet name already exists");
        
    // Process valid request
    var pet = petService.Create(request);
    return Created($"/api/pets/{pet.Id}", pet);
}
```

## Action Filters

### Authorization Filters

```csharp
[Authorize(Roles = "Admin")]
public IActionResult DeletePet(int id)
{
    // Only admin users can delete pets
    petService.Delete(id);
    return NoContent();
}
```

### Action Filters

```csharp
[ServiceFilter(typeof(LoggingFilter))]
public IActionResult GetPets()
{
    // Logging filter executes before/after action
    return Ok(pets);
}
```

## Dependency Injection in Controllers

### Service Injection

```csharp
[ApiController]
[Route("api/pets")]
public class PetsController : ControllerBase
{
    private readonly IPetService petService;
    private readonly ILogger<PetsController> logger;
    
    public PetsController(IPetService petService, ILogger<PetsController> logger)
    {
        this.petService = petService;
        this.logger = logger;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetPets()
    {
        logger.LogInformation("Retrieving all pets");
        var pets = await petService.GetAllAsync();
        return Ok(pets);
    }
}
```

**Constructor Injection**: Services injected via constructor

**Interface Dependencies**: Depend on abstractions, not implementations

**Lifetime Management**: Container manages service lifetimes

## Best Practices Implemented

### 1. RESTful Design

- Resource-based URL structure
- Appropriate HTTP verb usage
- Consistent response patterns

### 2. Security First

- Authorization attributes on protected endpoints
- JWT token validation
- Proper error handling without information leakage

### 3. Model Binding

- Explicit binding source attributes
- Strong typing with DTOs
- Automatic validation

### 4. Separation of Concerns

- Controllers handle HTTP concerns only
- Business logic delegated to services
- Clean dependency injection

### 5. Error Handling

- Appropriate HTTP status codes
- Consistent error response format
- Proper exception logging

## Future Enhancements

### Expanded Pet Operations

```csharp
[HttpPost]
public IActionResult CreatePet([FromBody] CreatePetRequest request)
{
    // Implementation for creating pets
}

[HttpPut("{id}")]
public IActionResult UpdatePet(int id, [FromBody] UpdatePetRequest request)
{
    // Implementation for updating pets
}

[HttpDelete("{id}")]
public IActionResult DeletePet(int id)
{
    // Implementation for deleting pets
}
```

### Advanced Features

- **Pagination**: Handle large datasets
- **Filtering**: Query parameters for data filtering
- **Sorting**: Configurable result ordering
- **Versioning**: API version management
- **Rate Limiting**: Prevent API abuse

## Next Steps

- [Security and CORS](./04-security-cors.md)
- [Configuration and Startup](./05-configuration-startup.md)
