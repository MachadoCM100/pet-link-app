namespace PetLink.API.Models
{
    // Standardized API response structure
    // Includes success status, message, data, and error details
    // Used across the API for consistent response formatting
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Success response with data
        public static ApiResponse<T> SuccessResponse(T data, string message = "Success")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        // Success response without data
        public static ApiResponse<T> SuccessResponse(string message = "Success")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message
            };
        }

        // Error response with single error message
        public static ApiResponse<T> ErrorResponse(string message)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message
            };
        }

        // Error response with multiple error messages
        public static ApiResponse<T> ErrorResponse(string message, List<string> errors)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors
            };
        }
    }

    // Paginated response structure
    public class PaginatedResponse<T> : ApiResponse<List<T>>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }

        public static PaginatedResponse<T> Create(List<T> data, int page, int pageSize, int totalCount, string message = "Success")
        {
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            
            return new PaginatedResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages,
                HasPreviousPage = page > 1
            };
        }
    }
}
