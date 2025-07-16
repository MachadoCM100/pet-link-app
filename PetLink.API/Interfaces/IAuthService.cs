using PetLink.API.Models;

namespace PetLink.API.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> AuthenticateAsync(LoginRequest request);
        Task<bool> ValidateUserAsync(string username, string password);
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User> RegisterAsync(RegisterRequest request);
        Task<LoginResponse?> RefreshTokenAsync(string refreshToken);
        string GenerateJwtToken(string username);
    }
}
