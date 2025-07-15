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
