using Microsoft.IdentityModel.Tokens;
using PetLink.API.Interfaces;
using PetLink.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PetLink.API.Services
{
    public class AuthService : IAuthService
    {
        // Demo credentials - in a real application, this would come from a database
        private const string DemoUsername = "admin";
        private const string DemoPassword = "password";
        private const string SecretKey = "this is my custom Secret key for authentication";

        public Task<LoginResponse?> AuthenticateAsync(LoginRequest request)
        {
            if (!ValidateUserAsync(request.Username, request.Password).Result)
                return Task.FromResult<LoginResponse?>(null);

            var token = GenerateJwtToken(request.Username);
            return Task.FromResult<LoginResponse?>(new LoginResponse { Token = token });
        }

        public Task<bool> ValidateUserAsync(string username, string password)
        {
            // In a real application, this would validate against a database
            // with proper password hashing
            var isValid = username == DemoUsername && password == DemoPassword;
            return Task.FromResult(isValid);
        }

        public string GenerateJwtToken(string username)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] 
                { 
                    new Claim(ClaimTypes.Name, username),
                    new Claim(ClaimTypes.NameIdentifier, username)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
