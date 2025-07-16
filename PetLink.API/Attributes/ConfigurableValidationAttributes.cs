using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;
using PetLink.API.Configuration;

namespace PetLink.API.Models
{
    // Custom validation attributes that read from configuration
    public class ConfigurableStringLengthAttribute : ValidationAttribute
    {
        private readonly string _settingsPath;
        private readonly string _minProperty;
        private readonly string _maxProperty;

        public ConfigurableStringLengthAttribute(string settingsPath, string minProperty, string maxProperty)
        {
            _settingsPath = settingsPath;
            _minProperty = minProperty;
            _maxProperty = maxProperty;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var options = validationContext.GetService<IOptions<ValidationSettings>>();
            if (options?.Value == null)
                return new ValidationResult("Validation configuration not found");

            var settings = options.Value;
            
            // Use reflection to get the min/max values from configuration
            var settingsType = settings.GetType();
            var settingsProperty = settingsType.GetProperty(_settingsPath);
            var settingsObject = settingsProperty?.GetValue(settings);
            
            if (settingsObject == null)
                return new ValidationResult($"Settings path '{_settingsPath}' not found");

            var minValue = (int?)settingsObject.GetType().GetProperty(_minProperty)?.GetValue(settingsObject) ?? 0;
            var maxValue = (int?)settingsObject.GetType().GetProperty(_maxProperty)?.GetValue(settingsObject) ?? int.MaxValue;

            if (value is string str)
            {
                if (str.Length < minValue || str.Length > maxValue)
                {
                    return new ValidationResult($"{validationContext.DisplayName} must be between {minValue} and {maxValue} characters");
                }
            }

            return ValidationResult.Success;
        }
    }

    public class ConfigurableRangeAttribute : ValidationAttribute
    {
        private readonly string _settingsPath;
        private readonly string _minProperty;
        private readonly string _maxProperty;

        public ConfigurableRangeAttribute(string settingsPath, string minProperty, string maxProperty)
        {
            _settingsPath = settingsPath;
            _minProperty = minProperty;
            _maxProperty = maxProperty;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null) return ValidationResult.Success; // Let [Required] handle null

            var options = validationContext.GetService<IOptions<ValidationSettings>>();
            if (options?.Value == null)
                return new ValidationResult("Validation configuration not found");

            var settings = options.Value;
            
            // Use reflection to get the min/max values from configuration
            var settingsType = settings.GetType();
            var settingsProperty = settingsType.GetProperty(_settingsPath);
            var settingsObject = settingsProperty?.GetValue(settings);
            
            if (settingsObject == null)
                return new ValidationResult($"Settings path '{_settingsPath}' not found");

            var minValue = (int?)settingsObject.GetType().GetProperty(_minProperty)?.GetValue(settingsObject) ?? 0;
            var maxValue = (int?)settingsObject.GetType().GetProperty(_maxProperty)?.GetValue(settingsObject) ?? int.MaxValue;

            if (value is int intValue)
            {
                if (intValue < minValue || intValue > maxValue)
                {
                    return new ValidationResult($"{validationContext.DisplayName} must be between {minValue} and {maxValue}");
                }
            }

            return ValidationResult.Success;
        }
    }
}
