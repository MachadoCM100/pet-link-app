using PetLink.API.Models;

namespace PetLink.API.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> AuthenticateAsync(LoginRequest request);
        Task<bool> ValidateUserAsync(string username, string password);
        string GenerateJwtToken(string username);
    }
}
