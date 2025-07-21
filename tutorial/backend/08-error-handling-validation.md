# Error Handling and Validation Architecture

## Overview

The PetLink API implements a comprehensive **centralized error handling and validation system** that ensures consistent, configurable, and maintainable error responses across all endpoints.

## 🎯 **Architecture Components**

### **1. Global Exception Middleware**

**Location:** `Middleware/GlobalExceptionMiddleware.cs`

Centralized exception handling that catches all unhandled exceptions and transforms them into standardized API responses.

```csharp
public class GlobalExceptionMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }
}
```

**Features:**
- Maps custom exceptions to appropriate HTTP status codes
- Environment-aware error details (hide sensitive info in production)
- Structured JSON error responses
- Automatic logging integration

### **2. Custom Exception Hierarchy**

**Location:** `Models/Exceptions.cs`

Type-safe exception system for different error scenarios:

```csharp
// Base exception
public abstract class CustomException : Exception
{
    public int StatusCode { get; }
    protected CustomException(string message, int statusCode) : base(message)
    {
        StatusCode = statusCode;
    }
}

// Specific exceptions
public class ValidationException : CustomException         // 400 Bad Request
public class NotFoundException : CustomException           // 404 Not Found  
public class UnauthorizedException : CustomException       // 401 Unauthorized
public class BusinessLogicException : CustomException      // 400 Bad Request
public class ConflictException : CustomException           // 409 Conflict
```

### **3. Standardized API Responses**

**Location:** `Models/ApiResponse.cs`

Consistent response structure across all endpoints:

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; }
}

public class PaginatedResponse<T> : ApiResponse<IEnumerable<T>>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}
```

## 🔧 **Configuration-Driven Validation**

### **4. Validation Configuration**

**Location:** `Configuration/ValidationConfiguration.cs`

Centralized validation rules and error messages:

```csharp
public class ValidationSettings
{
    public PetValidationSettings Pet { get; set; } = new();
    public UserValidationSettings User { get; set; } = new();
    public PaginationSettings Pagination { get; set; } = new();
}

public class PetValidationSettings
{
    public int NameMinLength { get; set; } = 2;      // Default fallback
    public int NameMaxLength { get; set; } = 50;     // Default fallback
    public int TypeMinLength { get; set; } = 2;      // Default fallback
    // ... more rules
}
```

**Configuration File:** `appsettings.Validation.json`

```json
{
  "ValidationSettings": {
    "Pet": {
      "NameMinLength": 2,
      "NameMaxLength": 50,
      "TypeMinLength": 2,
      "TypeMaxLength": 30,
      "DescriptionMaxLength": 500,
      "MinAge": 0,
      "MaxAge": 50
    }
  },
  "ErrorMessages": {
    "Pet": {
      "NotFound": "Pet not found",
      "AlreadyAdopted": "Pet is already adopted",
      "DuplicateName": "A pet with this name already exists"
    }
  }
}
```

### **5. Validation Helper**

**Location:** `Helpers/ValidationHelper.cs`

Business logic validation using configuration:

```csharp
public static class ValidationHelper
{
    public static void ValidatePetRequestBusinessRules(
        CreatePetRequest request, 
        PetValidationSettings settings)
    {
        if (request.Name?.Length < settings.NameMinLength)
            throw new ValidationException($"Pet name must be at least {settings.NameMinLength} characters");
            
        if (request.Age < settings.MinAge || request.Age > settings.MaxAge)
            throw new ValidationException($"Pet age must be between {settings.MinAge} and {settings.MaxAge}");
    }
}
```

## 🚀 **Validation Flow**

### **Clean Validation Pipeline**

```
1. HTTP Request
   ↓
2. [ValidateModel] Filter (basic model annotation validation)
   ↓
3. Controller (data mapping only)
   ↓
4. Service Layer (ValidationHelper.ValidatePetRequestBusinessRules())
   ↓
5. Database Operation
```

### **6. Global Validation Filter**

**Location:** `Filters/ValidationFilters.cs`

Automatic model state validation for all endpoints:

```csharp
public class ValidateModelAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errorMessages = context.HttpContext.RequestServices
                .GetRequiredService<IOptions<ErrorMessages>>();
                
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            var response = new ApiResponse<object>
            {
                Success = false,
                Message = errorMessages.Value.General.ValidationFailed,
                Errors = errors,
                Timestamp = DateTime.UtcNow
            };

            context.Result = new BadRequestObjectResult(response);
        }
    }
}
```

### **7. Enhanced Base Controller**

**Location:** `Controllers/BaseController.cs`

Standardized response methods:

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

## 🔧 **Integration & Configuration**

### **Program.cs Setup**

```csharp
// Load validation configuration (optional - uses defaults if missing)
builder.Configuration.AddJsonFile("appsettings.Validation.json", optional: true, reloadOnChange: true);

// Configure validation settings
builder.Services.Configure<ValidationSettings>(
    builder.Configuration.GetSection("ValidationSettings"));
builder.Services.Configure<ErrorMessages>(
    builder.Configuration.GetSection("ErrorMessages"));

// Add global validation filter
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateModelAttribute>();
})
.ConfigureApiBehaviorOptions(options =>
{
    // We handle validation globally
    options.SuppressModelStateInvalidFilter = true;
});

// Register middleware
app.UseMiddleware<GlobalExceptionMiddleware>();
```

## 💡 **Benefits**

### **Configuration Benefits**

- ✅ **Resilient**: Falls back to C# defaults if JSON config is missing
- ✅ **Flexible**: Change validation rules without recompiling
- ✅ **Environment-specific**: Different rules for dev/staging/production
- ✅ **Centralized**: All validation logic in one place

### **Architecture Benefits**

- ✅ **Consistent**: Standardized response format across all endpoints
- ✅ **Maintainable**: Single source of truth for error handling
- ✅ **Testable**: Clean separation of validation logic
- ✅ **Professional**: Proper HTTP status codes and structured responses

## 🎯 **Usage Examples**

### **Controller Implementation (Clean)**

```csharp
[HttpPost]
[ValidateModel]  // Automatic model validation
public async Task<IActionResult> CreatePet([FromBody] CreatePetRequest request)
{
    var pet = new Pet
    {
        Name = request.Name,
        Type = request.Type,
        Description = request.Description,
        Age = request.Age,
        Adopted = false,
        CreatedAt = DateTime.UtcNow
    };

    var createdPet = await _petService.CreatePetAsync(pet);
    return Created(createdPet, "Pet created successfully");
}
```

### **Service Implementation (Business Validation)**

```csharp
public async Task<Pet> CreatePetAsync(Pet pet)
{
    // Business logic validation using configuration
    var request = new CreatePetRequest 
    { 
        Name = pet.Name, 
        Type = pet.Type, 
        Age = pet.Age 
    };
    
    ValidationHelper.ValidatePetRequestBusinessRules(request, _validationSettings.Pet);

    // Check business rules
    if (await PetExistsWithNameAsync(pet.Name))
        throw new ConflictException("A pet with this name already exists");

    // Database operation
    return await SavePetAsync(pet);
}
```

### **Standardized Error Responses**

All endpoints return consistent error format:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    "Pet name must be at least 2 characters",
    "Pet age must be between 0 and 50"
  ],
  "timestamp": "2025-07-16T10:30:00Z"
}
```

This architecture provides a solid, scalable foundation for error handling and validation in the PetLink API, ensuring consistency, maintainability, and professional-grade error responses.
