using System.ComponentModel.DataAnnotations;

namespace PetLink.API.Models
{
    public class Pet
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Pet name is required")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Pet type is required")]
        public string Type { get; set; } = string.Empty;
        
        public bool Adopted { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public string? Description { get; set; }
        
        public int? Age { get; set; }
    }

    // DTO for creating pets (excludes Id and CreatedAt)
    public class CreatePetRequest
    {
        [Required(ErrorMessage = "Pet name is required")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Pet type is required")]
        public string Type { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public int? Age { get; set; }
    }

    // DTO for updating pets
    public class UpdatePetRequest
    {
        [Required(ErrorMessage = "Pet name is required")]
        public string Name { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Pet type is required")]
        public string Type { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public int? Age { get; set; }
    }
}
