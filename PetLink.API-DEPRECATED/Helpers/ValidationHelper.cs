using PetLink.API.Models;
using PetLink.API.Configuration;
using CustomValidationException = PetLink.API.Models.ValidationException;

namespace PetLink.API.Helpers
{
    public static class ValidationHelper
    {
        // Basic validation utilities
        public static void ValidateId(int id, string idName = "ID")
        {
            if (id <= 0)
                throw new CustomValidationException($"{idName} must be greater than 0");
        }

        public static void ValidatePagination(int page, int pageSize, PaginationSettings? settings = null)
        {
            var maxPageSize = settings?.MaxPageSize ?? 100;
            
            if (page < 1)
                throw new CustomValidationException("Page must be greater than 0");
            
            if (pageSize < 1 || pageSize > maxPageSize)
                throw new CustomValidationException($"PageSize must be between 1 and {maxPageSize}");
        }

        // Business logic validation for pets (after model validation has passed)
        public static void ValidatePetBusinessRules(Pet pet, PetValidationSettings settings, ErrorMessages errorMessages)
        {
            // Additional length checks using configuration
            if (pet.Name.Length < settings.NameMinLength || pet.Name.Length > settings.NameMaxLength)
                throw new CustomValidationException($"Pet name must be between {settings.NameMinLength} and {settings.NameMaxLength} characters");

            if (pet.Type.Length < settings.TypeMinLength || pet.Type.Length > settings.TypeMaxLength)
                throw new CustomValidationException($"Pet type must be between {settings.TypeMinLength} and {settings.TypeMaxLength} characters");

            // Type validation
            if (!IsValidPetType(pet.Type))
                throw new CustomValidationException("Pet type can only contain letters and spaces");

            // Description validation
            if (!string.IsNullOrEmpty(pet.Description) && pet.Description.Length > settings.DescriptionMaxLength)
                throw new CustomValidationException($"Description cannot exceed {settings.DescriptionMaxLength} characters");

            // Age validation
            if (pet.Age.HasValue && (pet.Age < settings.MinAge || pet.Age > settings.MaxAge))
                throw new CustomValidationException($"Age must be between {settings.MinAge} and {settings.MaxAge} years");
        }

        // Business logic validation for create requests
        public static void ValidatePetRequestBusinessRules(CreatePetRequest request, PetValidationSettings settings)
        {
            // Additional length checks using configuration
            if (request.Name.Length < settings.NameMinLength || request.Name.Length > settings.NameMaxLength)
                throw new CustomValidationException($"Pet name must be between {settings.NameMinLength} and {settings.NameMaxLength} characters");

            if (request.Type.Length < settings.TypeMinLength || request.Type.Length > settings.TypeMaxLength)
                throw new CustomValidationException($"Pet type must be between {settings.TypeMinLength} and {settings.TypeMaxLength} characters");

            // Type validation
            if (!IsValidPetType(request.Type))
                throw new CustomValidationException("Pet type can only contain letters and spaces");

            // Description validation
            if (!string.IsNullOrEmpty(request.Description) && request.Description.Length > settings.DescriptionMaxLength)
                throw new CustomValidationException($"Description cannot exceed {settings.DescriptionMaxLength} characters");

            // Age validation
            if (request.Age.HasValue && (request.Age < settings.MinAge || request.Age > settings.MaxAge))
                throw new CustomValidationException($"Age must be between {settings.MinAge} and {settings.MaxAge} years");
        }

        // Business logic validation for update requests
        public static void ValidatePetRequestBusinessRules(UpdatePetRequest request, PetValidationSettings settings)
        {
            // Additional length checks using configuration
            if (request.Name.Length < settings.NameMinLength || request.Name.Length > settings.NameMaxLength)
                throw new CustomValidationException($"Pet name must be between {settings.NameMinLength} and {settings.NameMaxLength} characters");

            if (request.Type.Length < settings.TypeMinLength || request.Type.Length > settings.TypeMaxLength)
                throw new CustomValidationException($"Pet type must be between {settings.TypeMinLength} and {settings.TypeMaxLength} characters");

            // Type validation
            if (!IsValidPetType(request.Type))
                throw new CustomValidationException("Pet type can only contain letters and spaces");

            // Description validation
            if (!string.IsNullOrEmpty(request.Description) && request.Description.Length > settings.DescriptionMaxLength)
                throw new CustomValidationException($"Description cannot exceed {settings.DescriptionMaxLength} characters");

            // Age validation
            if (request.Age.HasValue && (request.Age < settings.MinAge || request.Age > settings.MaxAge))
                throw new CustomValidationException($"Age must be between {settings.MinAge} and {settings.MaxAge} years");
        }

        // Authentication validation methods
        public static void ValidateLoginRequestBusinessRules(LoginRequest request, UserValidationSettings settings)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                throw new CustomValidationException("Username is required");

            if (request.Username.Length < settings.UsernameMinLength)
                throw new CustomValidationException($"Username must be at least {settings.UsernameMinLength} characters");

            if (request.Username.Length > settings.UsernameMaxLength)
                throw new CustomValidationException($"Username cannot exceed {settings.UsernameMaxLength} characters");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new CustomValidationException("Password is required");

            if (request.Password.Length < settings.PasswordMinLength)
                throw new CustomValidationException($"Password must be at least {settings.PasswordMinLength} characters");

            if (request.Password.Length > settings.PasswordMaxLength)
                throw new CustomValidationException($"Password cannot exceed {settings.PasswordMaxLength} characters");
        }

        public static void ValidateRegisterRequestBusinessRules(RegisterRequest request, UserValidationSettings settings)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                throw new CustomValidationException("Username is required");

            if (request.Username.Length < settings.UsernameMinLength)
                throw new CustomValidationException($"Username must be at least {settings.UsernameMinLength} characters");

            if (request.Username.Length > settings.UsernameMaxLength)
                throw new CustomValidationException($"Username cannot exceed {settings.UsernameMaxLength} characters");

            // Username format validation
            if (!System.Text.RegularExpressions.Regex.IsMatch(request.Username, @"^[a-zA-Z0-9_]+$"))
                throw new CustomValidationException("Username can only contain letters, numbers, and underscores");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new CustomValidationException("Password is required");

            if (request.Password.Length < settings.PasswordMinLength)
                throw new CustomValidationException($"Password must be at least {settings.PasswordMinLength} characters");

            if (request.Password.Length > settings.PasswordMaxLength)
                throw new CustomValidationException($"Password cannot exceed {settings.PasswordMaxLength} characters");

            if (string.IsNullOrWhiteSpace(request.Email))
                throw new CustomValidationException("Email is required");

            if (request.Email.Length > settings.EmailMaxLength)
                throw new CustomValidationException($"Email cannot exceed {settings.EmailMaxLength} characters");

            // Email format validation (additional business rule)
            if (!IsValidEmail(request.Email))
                throw new CustomValidationException("Invalid email format");
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsValidPetType(string type)
        {
            // Only letters and spaces allowed
            return !string.IsNullOrEmpty(type) && type.All(c => char.IsLetter(c) || char.IsWhiteSpace(c));
        }
    }
}