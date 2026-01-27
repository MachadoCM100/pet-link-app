namespace PetLink.API.Models
{
    // Base exception class for custom exceptions
    public abstract class CustomException : Exception
    {
        protected CustomException(string message) : base(message) { }
        protected CustomException(string message, Exception innerException) : base(message, innerException) { }
    }

    // Exception for validation errors
    public class ValidationException : CustomException
    {
        public List<string> Errors { get; }

        public ValidationException(string message) : base(message)
        {
            Errors = new List<string> { message };
        }

        public ValidationException(List<string> errors) : base("Validation failed")
        {
            Errors = errors;
        }

        public ValidationException(string fieldName, string errorMessage) : base($"Validation failed for {fieldName}")
        {
            Errors = new List<string> { $"{fieldName}: {errorMessage}" };
        }
    }

    // Exception for not found resources
    public class NotFoundException : CustomException
    {
        public NotFoundException(string message) : base(message) { }
        public NotFoundException(string resourceType, object id) : base($"{resourceType} with ID {id} was not found") { }
    }

    // Exception for unauthorized access
    public class UnauthorizedException : CustomException
    {
        public UnauthorizedException(string message = "Unauthorized access") : base(message) { }
    }

    // Exception for business logic violations
    public class BusinessLogicException : CustomException
    {
        public BusinessLogicException(string message) : base(message) { }
    }

    // Exception for conflicts (e.g., duplicate resources)
    public class ConflictException : CustomException
    {
        public ConflictException(string message) : base(message) { }
    }
}
