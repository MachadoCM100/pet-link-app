using Microsoft.AspNetCore.Mvc;
using PetLink.API.Models;

namespace PetLink.API.Controllers
{
    // Base controller for all API controllers
    // Provides common response methods for success and error handling
    [ApiController]
    public abstract class BaseController : ControllerBase
    {
        // Success responses
        protected IActionResult Success<T>(T data, string message = "Operation completed successfully")
        {
            return Ok(ApiResponse<T>.SuccessResponse(data, message));
        }

        protected IActionResult Success(string message = "Operation completed successfully")
        {
            return Ok(ApiResponse<object>.SuccessResponse(message));
        }

        protected IActionResult Created<T>(T data, string message = "Resource created successfully")
        {
            return StatusCode(201, ApiResponse<T>.SuccessResponse(data, message));
        }

        protected IActionResult NoContent(string message = "Operation completed successfully")
        {
            return StatusCode(204);
        }

        // Error responses
        protected IActionResult BadRequest(string message, List<string>? errors = null)
        {
            return BadRequest(errors != null 
                ? ApiResponse<object>.ErrorResponse(message, errors)
                : ApiResponse<object>.ErrorResponse(message));
        }

        protected IActionResult NotFound(string message)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(message));
        }

        protected IActionResult Unauthorized(string message = "Unauthorized access")
        {
            return Unauthorized(ApiResponse<object>.ErrorResponse(message));
        }

        protected IActionResult Conflict(string message)
        {
            return Conflict(ApiResponse<object>.ErrorResponse(message));
        }

        protected IActionResult InternalServerError(string message = "An internal server error occurred")
        {
            return StatusCode(500, ApiResponse<object>.ErrorResponse(message));
        }

        // Paginated response
        protected IActionResult Paginated<T>(List<T> data, int page, int pageSize, int totalCount, string message = "Data retrieved successfully")
        {
            return Ok(PaginatedResponse<T>.Create(data, page, pageSize, totalCount, message));
        }
    }
}
