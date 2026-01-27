namespace PetLink.API.Configuration
{
    public class ValidationSettings
    {
        public PetValidationSettings Pet { get; set; } = new();
        public UserValidationSettings User { get; set; } = new();
        public PaginationSettings Pagination { get; set; } = new();
    }

    public class PetValidationSettings
    {
        public int NameMinLength { get; set; } = 2;
        public int NameMaxLength { get; set; } = 50;
        public int TypeMinLength { get; set; } = 2;
        public int TypeMaxLength { get; set; } = 30;
        public int DescriptionMaxLength { get; set; } = 500;
        public int MinAge { get; set; } = 0;
        public int MaxAge { get; set; } = 50;
    }

    public class UserValidationSettings
    {
        public int UsernameMinLength { get; set; } = 3;
        public int UsernameMaxLength { get; set; } = 50;
        public int PasswordMinLength { get; set; } = 6;
        public int PasswordMaxLength { get; set; } = 100;
        public int EmailMaxLength { get; set; } = 100;
    }

    public class PaginationSettings
    {
        public int DefaultPageSize { get; set; } = 10;
        public int MaxPageSize { get; set; } = 100;
    }

    public class ErrorMessages
    {
        public GeneralErrorMessages General { get; set; } = new();
        public PetErrorMessages Pet { get; set; } = new();
        public AuthErrorMessages Auth { get; set; } = new();
    }

    public class GeneralErrorMessages
    {
        public string ValidationFailed { get; set; } = "Validation failed";
        public string NotFound { get; set; } = "Resource not found";
        public string Unauthorized { get; set; } = "Unauthorized access";
        public string InternalServerError { get; set; } = "An internal server error occurred";
    }

    public class PetErrorMessages
    {
        public string NotFound { get; set; } = "Pet not found";
        public string AlreadyAdopted { get; set; } = "Pet is already adopted";
        public string CannotDeleteAdopted { get; set; } = "Cannot delete an adopted pet";
        public string DuplicateName { get; set; } = "A pet with this name already exists";
    }

    public class AuthErrorMessages
    {
        public string InvalidCredentials { get; set; } = "Invalid username or password";
        public string UserExists { get; set; } = "Username already exists";
        public string EmailExists { get; set; } = "Email already exists";
        public string InvalidToken { get; set; } = "Invalid or expired token";
    }
}
