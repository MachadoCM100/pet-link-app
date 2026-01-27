# Security and CORS

## Overview

The PetLink API implements comprehensive security measures including JWT authentication, CORS (Cross-Origin Resource Sharing) configuration, and secure development practices. These features enable secure communication between the frontend and backend while protecting against common web vulnerabilities.

## CORS Configuration

### Cross-Origin Resource Sharing Setup

CORS is configured in `Program.cs` to allow the Angular frontend to communicate with the API.

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

var app = builder.Build();
app.UseCors("LocalhostPolicy");
```

### CORS Policy Analysis

#### Origin Configuration

```csharp
.WithOrigins("http://localhost:4200")
```

**Purpose**: Specifies allowed origins for cross-origin requests

**Development Setup**: Angular dev server runs on port 4200

**Security**: Restricts API access to specific domains

**Production Consideration**: Update with production frontend URLs

#### Method and Header Permissions

```csharp
.AllowAnyMethod()
.AllowAnyHeader()
```

**AllowAnyMethod**: Permits all HTTP verbs (GET, POST, PUT, DELETE)

**AllowAnyHeader**: Allows any request headers

**Development Convenience**: Simplifies development without header restrictions

**Production Refinement**: Can be restricted to specific methods/headers

#### Credential Support

```csharp
.AllowCredentials()
```

**Purpose**: Allows cookies and authorization headers

**JWT Integration**: Required for Bearer token authentication

**Security Impact**: Enables authenticated cross-origin requests

### CORS Middleware Placement

```csharp
app.UseCors("LocalhostPolicy");
app.UseAuthentication();
app.UseAuthorization();
```

**Order Importance**: CORS must execute before authentication

**Request Processing**: Handles preflight OPTIONS requests

**Error Prevention**: Prevents CORS errors during authentication

## JWT Security Implementation

### Token-Based Authentication

The application uses JSON Web Tokens for stateless authentication.

```csharp
var tokenDescriptor = new SecurityTokenDescriptor
{
    Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, request.Username) }),
    Expires = DateTime.UtcNow.AddHours(1),
    SigningCredentials = new SigningCredentials(
        new SymmetricSecurityKey(key), 
        SecurityAlgorithms.HmacSha256Signature)
};
```

### Security Features

#### Token Expiration

```csharp
Expires = DateTime.UtcNow.AddHours(1)
```

**Purpose**: Limits token lifetime to reduce exposure risk

**Duration**: 1-hour expiration for demo (production may vary)

**Security Benefit**: Expired tokens automatically become invalid

#### Cryptographic Signing

```csharp
SigningCredentials = new SigningCredentials(
    new SymmetricSecurityKey(key), 
    SecurityAlgorithms.HmacSha256Signature)
```

**Algorithm**: HMAC SHA-256 for token integrity

**Key**: Shared secret for signing and validation

**Tamper Protection**: Invalid signature detection

#### Claims-Based Identity

```csharp
Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, request.Username) })
```

**Claims Storage**: User information embedded in token

**Stateless**: No server-side session storage required

**Scalability**: Tokens are self-contained

## Authentication Middleware

### JWT Bearer Configuration

```csharp
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
```

### Validation Parameters

#### Signature Validation

```csharp
ValidateIssuerSigningKey = true,
IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(key))
```

**Purpose**: Ensures token integrity and authenticity

**Key Matching**: Same key used for signing and validation

**Security**: Prevents token forgery

#### Issuer and Audience Validation

```csharp
ValidateIssuer = false,
ValidateAudience = false,
```

**Demo Setting**: Disabled for development simplicity

**Production Recommendation**: Enable for enhanced security

**Purpose**: Validates token creator and intended recipient

## Request Processing Security

### Authorization Attribute Protection

```csharp
[ApiController]
[Route("api/pets")]
[Authorize]
public class PetsController : ControllerBase
```

**Attribute Effect**: Requires valid authentication for all actions

**Automatic Processing**: Middleware handles token validation

**Response**: 401 Unauthorized for invalid/missing tokens

### Bearer Token Extraction

The middleware automatically:

1. **Extracts Token**: From Authorization header
2. **Validates Format**: Checks "Bearer {token}" pattern
3. **Verifies Signature**: Ensures token integrity
4. **Populates Identity**: Creates authenticated user context

## Security Headers

### Automatic Security Headers

ASP.NET Core provides built-in security headers:

- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: MIME type sniffing protection
- **X-XSS-Protection**: Cross-site scripting protection

### Custom Security Headers

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Custom-Header", "PetLink-API");
    await next();
});
```

## HTTPS and Development

### Development Configuration

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "applicationUrl": "http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

**HTTP Only**: Development uses HTTP for simplicity

**Production Requirement**: HTTPS mandatory for production

**Certificate**: Production requires valid SSL certificate

### HTTPS Enforcement

```csharp
// Production configuration
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts(); // HTTP Strict Transport Security
}
```

## Error Handling Security

### Information Disclosure Prevention

```csharp
if (request.Username != DemoUsername || request.Password != DemoPassword)
    return Unauthorized(); // Generic error, no specific details
```

**Security Principle**: Don't reveal why authentication failed

**Attack Prevention**: Prevents username enumeration

**Consistent Response**: Same error for all auth failures

### Exception Handling

```csharp
app.UseExceptionHandler("/error");
```

**Production Benefit**: Hides implementation details

**Security**: Prevents stack trace exposure

**User Experience**: Consistent error responses

## API Key Alternative (Future Enhancement)

### API Key Authentication

```csharp
[ApiKey]
public class SecureController : ControllerBase
{
    // Protected by API key instead of JWT
}
```

**Use Case**: Machine-to-machine communication

**Implementation**: Custom attribute filter

**Security**: Different from user authentication

## Security Best Practices Implemented

### 1. Token-Based Authentication

- **Stateless**: No server-side session storage
- **Time-Limited**: Tokens expire to limit exposure
- **Cryptographically Signed**: Prevents tampering

### 2. CORS Configuration

- **Origin Restriction**: Only specific domains allowed
- **Method Control**: Can restrict HTTP methods
- **Credential Support**: Enables authenticated requests

### 3. Secure Defaults

- **HTTPS Ready**: Production HTTPS configuration
- **Security Headers**: Built-in protection headers
- **Error Handling**: No information disclosure

### 4. Development vs Production

- **Environment Awareness**: Different configs per environment
- **Debug Information**: Limited to development
- **Security Hardening**: Production-specific security measures

## Production Security Checklist

### Essential Production Changes

1. **Secret Management**: Move secrets to configuration/key vault
2. **HTTPS Enforcement**: Require HTTPS for all communications
3. **CORS Restrictions**: Limit to specific production domains
4. **Token Validation**: Enable issuer and audience validation
5. **Logging**: Security event logging and monitoring

### Advanced Security Features

1. **Rate Limiting**: Prevent API abuse
2. **Input Validation**: Comprehensive request validation
3. **SQL Injection Protection**: Parameterized queries
4. **XSS Prevention**: Output encoding
5. **CSRF Protection**: Anti-forgery tokens

## Security Monitoring

### Logging Security Events

```csharp
public IActionResult Login([FromBody] LoginRequest request)
{
    logger.LogInformation("Login attempt for user: {Username}", request.Username);
    
    if (request.Username != DemoUsername || request.Password != DemoPassword)
    {
        logger.LogWarning("Failed login attempt for user: {Username}", request.Username);
        return Unauthorized();
    }
    
    logger.LogInformation("Successful login for user: {Username}", request.Username);
    // ... token generation
}
```

### Security Metrics

- **Failed Authentication Attempts**: Monitor brute force attacks
- **Token Usage Patterns**: Identify unusual access patterns
- **CORS Violations**: Track unauthorized origin attempts

## Next Steps

- [Configuration and Startup](./05-configuration-startup.md)
- [Development Environment Setup](../setup/development-environment.md)
