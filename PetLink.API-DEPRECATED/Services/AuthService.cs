using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using PetLink.API.Interfaces;
using PetLink.API.Models;
using PetLink.API.Configuration;
using PetLink.API.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PetLink.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ValidationSettings _validationSettings;
        private readonly ErrorMessages _errorMessages;

        // Demo users - in a real application, this would come from a database
        private static readonly List<User> _users = new()
        {
            new User 
            { 
                Username = "admin", 
                Password = "password", // In real app, this would be hashed
                Email = "admin@petlink.com",
                CreatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new User 
            { 
                Username = "user", 
                Password = "userpass", // In real app, this would be hashed
                Email = "user@petlink.com",
                CreatedAt = DateTime.UtcNow.AddDays(-15)
            }
        };

        private const string SecretKey = "this is my custom Secret key for authentication";

        public AuthService(IOptions<ValidationSettings> validationSettings, IOptions<ErrorMessages> errorMessages)
        {
            _validationSettings = validationSettings.Value;
            _errorMessages = errorMessages.Value;
        }

        public Task<LoginResponse?> AuthenticateAsync(LoginRequest request)
        {
            // Configuration-driven validation
            ValidationHelper.ValidateLoginRequestBusinessRules(request, _validationSettings.User);

            var user = _users.FirstOrDefault(u => u.Username == request.Username);
            if (user == null || user.Password != request.Password) // In real app, use password hashing
                throw new UnauthorizedException(_errorMessages.Auth.InvalidCredentials);

            var token = GenerateJwtToken(request.Username);
            var expiresAt = DateTime.UtcNow.AddHours(1);

            return Task.FromResult<LoginResponse?>(new LoginResponse 
            { 
                Token = token,
                ExpiresAt = expiresAt,
                Username = user.Username
            });
        }

        public Task<bool> ValidateUserAsync(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return Task.FromResult(false);

            var user = _users.FirstOrDefault(u => u.Username == username);
            return Task.FromResult(user != null && user.Password == password); // In real app, use password hashing
        }

        public Task<User?> GetUserByUsernameAsync(string username)
        {
            if (string.IsNullOrEmpty(username))
                throw new ValidationException("Username is required");

            var user = _users.FirstOrDefault(u => u.Username == username);
            return Task.FromResult(user);
        }

        public Task<User> RegisterAsync(RegisterRequest request)
        {
            // Configuration-driven validation
            ValidationHelper.ValidateRegisterRequestBusinessRules(request, _validationSettings.User);

            // Check if username already exists
            if (_users.Any(u => u.Username.Equals(request.Username, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException(_errorMessages.Auth.UserExists);

            // Check if email already exists
            if (_users.Any(u => u.Email?.Equals(request.Email, StringComparison.OrdinalIgnoreCase) == true))
                throw new ConflictException(_errorMessages.Auth.EmailExists);

            var user = new User
            {
                Username = request.Username,
                Password = request.Password, // In real app, hash this password
                Email = request.Email,
                CreatedAt = DateTime.UtcNow
            };

            _users.Add(user);
            return Task.FromResult(user);
        }

        public Task<LoginResponse?> RefreshTokenAsync(string refreshToken)
        {
            // For demo purposes, we'll just validate the token and issue a new one
            // In a real application, you'd validate the refresh token against a database
            
            if (string.IsNullOrEmpty(refreshToken))
                throw new ValidationException("Refresh token is required");

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(SecretKey);

                tokenHandler.ValidateToken(refreshToken, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var username = jwtToken.Claims.First(x => x.Type == ClaimTypes.Name).Value;

                var newToken = GenerateJwtToken(username);
                var expiresAt = DateTime.UtcNow.AddHours(1);

                return Task.FromResult<LoginResponse?>(new LoginResponse 
                { 
                    Token = newToken,
                    ExpiresAt = expiresAt,
                    Username = username
                });
            }
            catch
            {
                throw new UnauthorizedException(_errorMessages.Auth.InvalidToken);
            }
        }

        public string GenerateJwtToken(string username)
        {
            if (string.IsNullOrEmpty(username))
                throw new ValidationException("Username is required for token generation");

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
