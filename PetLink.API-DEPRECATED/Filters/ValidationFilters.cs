using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Options;
using PetLink.API.Models;
using PetLink.API.Configuration;

namespace PetLink.API.Filters
{
    public class ValidateModelAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                // Get error messages from DI container
                var errorMessages = context.HttpContext.RequestServices
                    .GetService<IOptions<ErrorMessages>>()?.Value;

                var errors = context.ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors)
                    .Select(x => x.ErrorMessage)
                    .ToList();

                var validationMessage = errorMessages?.General.ValidationFailed ?? "Validation failed";
                var response = ApiResponse<object>.ErrorResponse(validationMessage, errors);
                context.Result = new BadRequestObjectResult(response);
            }
        }
    }

    public class ValidateNotNullAttribute : ActionFilterAttribute
    {
        private readonly string _parameterName;

        public ValidateNotNullAttribute(string parameterName)
        {
            _parameterName = parameterName;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (context.ActionArguments.ContainsKey(_parameterName) && 
                context.ActionArguments[_parameterName] == null)
            {
                var response = ApiResponse<object>.ErrorResponse($"Parameter '{_parameterName}' cannot be null");
                context.Result = new BadRequestObjectResult(response);
            }
        }
    }
}
