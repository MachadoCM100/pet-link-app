using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetLink.API.Controllers;
using PetLink.API.Interfaces;
using PetLink.API.Models;
using PetLink.API.Filters;
using PetLink.API.Helpers;
using PetLink.API.Configuration;
using Microsoft.Extensions.Options;

[ApiController]
[Route("api/pets")]
[Authorize]
public class PetsController : BaseController
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets()
    {
        var pets = await _petService.GetAllPetsAsync();
        return Success(pets, "Pets retrieved successfully");
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPet(int id)
    {
        if (id <= 0)
            return BadRequest("Pet ID must be greater than 0");

        var pet = await _petService.GetPetByIdAsync(id);
        if (pet == null)
            return NotFound($"Pet with ID {id} not found");

        return Success(pet, "Pet retrieved successfully");
    }

    [HttpPost]
    [ValidateModel]
    public async Task<IActionResult> CreatePet([FromBody] CreatePetRequest request)
    {
        var pet = new Pet
        {
            Name = request.Name,
            Type = request.Type,
            Description = request.Description,
            Age = request.Age,
            Adopted = false,
            CreatedAt = DateTime.UtcNow
        };

        var createdPet = await _petService.CreatePetAsync(pet);
        return Created(createdPet, "Pet created successfully");
    }

    [HttpPut("{id}")]
    [ValidateModel]
    public async Task<IActionResult> UpdatePet(int id, [FromBody] UpdatePetRequest request)
    {
        if (id <= 0)
            return BadRequest("Pet ID must be greater than 0");

        var pet = new Pet
        {
            Id = id,
            Name = request.Name,
            Type = request.Type,
            Description = request.Description,
            Age = request.Age
        };

        var updatedPet = await _petService.UpdatePetAsync(id, pet);
        if (updatedPet == null)
            return NotFound($"Pet with ID {id} not found");

        return Success(updatedPet, "Pet updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        if (id <= 0)
            return BadRequest("Pet ID must be greater than 0");

        var deleted = await _petService.DeletePetAsync(id);
        if (!deleted)
            return NotFound($"Pet with ID {id} not found");

        return Success("Pet deleted successfully");
    }

    [HttpPost("{id}/adopt")]
    public async Task<IActionResult> AdoptPet(int id)
    {
        if (id <= 0)
            return BadRequest("Pet ID must be greater than 0");

        var adopted = await _petService.AdoptPetAsync(id);
        if (!adopted)
            return NotFound($"Pet with ID {id} not found");

        var pet = await _petService.GetPetByIdAsync(id);
        return Success(pet, "Pet adopted successfully");
    }
}
