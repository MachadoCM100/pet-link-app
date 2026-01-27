# Controllers and Endpoints

## Overview

The PetLink API uses ASP.NET Core controllers with a **service layer architecture** to handle HTTP requests and implement RESTful endpoints. Controllers focus purely on HTTP concerns while delegating business logic to dedicated services.

## Controller Architecture

### 1. Centralized Error Handling
- Global exception middleware handles all errors
- Controllers focus only on HTTP concerns
- Standardized API responses across all endpoints

### 2. Service Layer Integration
- Controllers inject and use service interfaces
- Business logic separated into service classes
- Clean separation of HTTP and business concerns

### 3. Automatic Validation
- Global validation filters handle model validation
- Configuration-driven validation rules
- Consistent error response format

### 4. RESTful Design Patterns
### 5. HTTP Verb Mapping  
### 6. Request/Response Handling
### 7. Authorization Integration

## BaseController - Standardized Responses

All controllers inherit from `BaseController` for consistent responses:

```csharp
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult Success<T>(T data, string message = "Success")
    {
        return Ok(new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }

    protected IActionResult Created<T>(T data, string message = "Resource created")
    {
        return StatusCode(201, new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }
}
```

## AuthController - Authentication Endpoints

Clean authentication controller with centralized error handling:

```csharp
[ApiController]
[Route("auth")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ValidateModel]  // Automatic validation
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.AuthenticateAsync(request);
        return Success(result, "Login successful");
    }

    [HttpPost("register")]
    [ValidateModel]  // Automatic validation
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = await _authService.RegisterAsync(request);
        return Created(new { username = user.Username, email = user.Email }, "User registered successfully");
    }

    [HttpPost("refresh")]
    [ValidateModel]  // Automatic validation
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.Token);
        return Success(result, "Token refreshed successfully");
    }
}
```

**Key Features:**
- ✅ **Clean Methods**: No manual validation or error handling
- ✅ **Automatic Validation**: `[ValidateModel]` handles basic validation
- ✅ **Consistent Responses**: Uses BaseController methods
- ✅ **Exception Handling**: Global middleware handles all errors
- ✅ **Business Logic**: All validation logic in AuthService

**Authentication Flow:**
1. **Request** → `[ValidateModel]` (basic validation)
2. **Controller** → Clean data mapping
3. **AuthService** → ValidationHelper (business rules) + configuration
4. **Response** → Standardized format via BaseController

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

Manages pet-related HTTP operations and delegates business logic to `IPetService`.

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetLink.API.Interfaces;
using PetLink.API.Models;

[ApiController]
[Route("api/pets")]
[Authorize]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets()
    {
        try
        {
            var pets = await _petService.GetAllPetsAsync();
            return Ok(pets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving pets.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPet(int id)
    {
        try
        {
            var pet = await _petService.GetPetByIdAsync(id);
            if (pet == null)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            return Ok(pet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the pet.", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePet([FromBody] Pet pet)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdPet = await _petService.CreatePetAsync(pet);
            return CreatedAtAction(nameof(GetPet), new { id = createdPet.Id }, createdPet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the pet.", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePet(int id, [FromBody] Pet pet)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedPet = await _petService.UpdatePetAsync(id, pet);
            if (updatedPet == null)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            return Ok(updatedPet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the pet.", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        try
        {
            var deleted = await _petService.DeletePetAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the pet.", details = ex.Message });
        }
    }

    [HttpPost("{id}/adopt")]
    public async Task<IActionResult> AdoptPet(int id)
    {
        try
        {
            var adopted = await _petService.AdoptPetAsync(id);
            if (!adopted)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            var pet = await _petService.GetPetByIdAsync(id);
            return Ok(pet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while adopting the pet.", details = ex.Message });
        }
    }
}
```

### Service Integration Pattern

#### Dependency Injection

```csharp
private readonly IPetService _petService;

public PetsController(IPetService petService)
{
    _petService = petService;
}
```

**Benefits**:

- **Separation of Concerns**: Controller handles HTTP, service handles business logic
- **Testability**: Easy to mock service dependencies
- **Maintainability**: Business logic centralized in services
- **Flexibility**: Can swap service implementations

#### Async Operations

```csharp
public async Task<IActionResult> GetPets()
{
    var pets = await _petService.GetAllPetsAsync();
    return Ok(pets);
}
```

**Pattern**: All service calls are asynchronous
**Benefits**: Non-blocking I/O operations, better scalability

### Complete CRUD Operations

#### 1. GET /api/pets - Get All Pets

```csharp
[HttpGet]
public async Task<IActionResult> GetPets()
```

**Purpose**: Retrieve all pets
**Returns**: 200 OK with pet array
**Authorization**: Required (JWT token)

#### 2. GET /api/pets/{id} - Get Single Pet

```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetPet(int id)
```

**Purpose**: Retrieve specific pet by ID
**Returns**: 200 OK with pet object, or 404 Not Found
**Authorization**: Required (JWT token)

#### 3. POST /api/pets - Create New Pet

```csharp
[HttpPost]
public async Task<IActionResult> CreatePet([FromBody] Pet pet)
```

**Purpose**: Create new pet
**Returns**: 201 Created with location header and pet object
**Authorization**: Required (JWT token)
**Validation**: Model validation applied

#### 4. PUT /api/pets/{id} - Update Pet

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdatePet(int id, [FromBody] Pet pet)
```

**Purpose**: Update existing pet
**Returns**: 200 OK with updated pet, or 404 Not Found
**Authorization**: Required (JWT token)
**Validation**: Model validation applied

#### 5. DELETE /api/pets/{id} - Delete Pet

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeletePet(int id)
```

**Purpose**: Delete pet by ID
**Returns**: 204 No Content, or 404 Not Found
**Authorization**: Required (JWT token)

#### 6. POST /api/pets/{id}/adopt - Adopt Pet

```csharp
[HttpPost("{id}/adopt")]
public async Task<IActionResult> AdoptPet(int id)
```

**Purpose**: Mark pet as adopted (business operation)
**Returns**: 200 OK with updated pet, or 404 Not Found
**Authorization**: Required (JWT token)
**Business Logic**: Updates adoption status through service

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

## Data Models

### Pet Model (`Models/Pet.cs`)

Primary entity for pet data:

```csharp
namespace PetLink.API.Models
{
    public class Pet
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Adopted { get; set; }
    }
}
```

**Properties**:

- **Id**: Unique identifier (auto-generated)
- **Name**: Pet name (required)
- **Type**: Pet type (e.g., "Cat", "Dog")
- **Adopted**: Adoption status (boolean)

### Authentication Models (`Models/AuthModels.cs`)

DTOs for authentication flow:

```csharp
namespace PetLink.API.Models
{
    public record LoginRequest(string Username, string Password);

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
    }

    public class User
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
```

**LoginRequest**: Input for authentication
**LoginResponse**: JWT token response
**User**: User entity (for future database integration)

### Error Handling Pattern

#### Structured Error Responses

```csharp
catch (Exception ex)
{
    return StatusCode(500, new { message = "An error occurred while retrieving pets.", details = ex.Message });
}
```

**Pattern**: Consistent error response format
**Information**: User-friendly message and technical details
**Security**: Controlled exposure of internal details

#### Validation Responses

```csharp
if (!ModelState.IsValid)
    return BadRequest(ModelState);
```

**Purpose**: Automatic model validation
**Response**: 400 Bad Request with validation errors
**Framework**: ASP.NET Core model binding and validation

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
