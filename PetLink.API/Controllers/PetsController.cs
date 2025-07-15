using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetLink.API.Interfaces;
using PetLink.API.Models;

[ApiController]
[Route("api/pets")]
[Authorize]
public class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPets()
    {
        try
        {
            var pets = await _petService.GetAllPetsAsync();
            return Ok(pets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving pets.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPet(int id)
    {
        try
        {
            var pet = await _petService.GetPetByIdAsync(id);
            if (pet == null)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            return Ok(pet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the pet.", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePet([FromBody] Pet pet)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdPet = await _petService.CreatePetAsync(pet);
            return CreatedAtAction(nameof(GetPet), new { id = createdPet.Id }, createdPet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the pet.", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePet(int id, [FromBody] Pet pet)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedPet = await _petService.UpdatePetAsync(id, pet);
            if (updatedPet == null)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            return Ok(updatedPet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the pet.", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePet(int id)
    {
        try
        {
            var deleted = await _petService.DeletePetAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the pet.", details = ex.Message });
        }
    }

    [HttpPost("{id}/adopt")]
    public async Task<IActionResult> AdoptPet(int id)
    {
        try
        {
            var adopted = await _petService.AdoptPetAsync(id);
            if (!adopted)
                return NotFound(new { message = $"Pet with ID {id} not found." });

            var pet = await _petService.GetPetByIdAsync(id);
            return Ok(pet);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while adopting the pet.", details = ex.Message });
        }
    }
}
