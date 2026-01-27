using Microsoft.AspNetCore.Mvc;
using PetLink.API.Interfaces;
using PetLink.API.Models;
using PetLink.API.Filters;
using PetLink.API.Controllers;

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
    [ValidateModel]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.AuthenticateAsync(request);
        return Success(result, "Login successful");
    }

    [HttpPost("register")]
    [ValidateModel]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = await _authService.RegisterAsync(request);
        return Created(new { username = user.Username, email = user.Email }, "User registered successfully");
    }

    [HttpPost("refresh")]
    [ValidateModel]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshTokenAsync(request.Token);
        return Success(result, "Token refreshed successfully");
    }
}
