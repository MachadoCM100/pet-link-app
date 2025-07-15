using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/pets")]
[Authorize]
public class PetsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetPets()
    {
        var pets = new[]
        {
            new { Id = 1, Name = "Fluffy", Type = "Cat", Adopted = false },
            new { Id = 2, Name = "Rover", Type = "Dog", Adopted = true }
        };
        return Ok(pets);
    }
}
