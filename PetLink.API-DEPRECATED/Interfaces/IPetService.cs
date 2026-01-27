using PetLink.API.Models;

namespace PetLink.API.Interfaces
{
    public interface IPetService
    {
        Task<IEnumerable<Pet>> GetAllPetsAsync();
        Task<Pet?> GetPetByIdAsync(int id);
        Task<Pet> CreatePetAsync(Pet pet);
        Task<Pet?> UpdatePetAsync(int id, Pet pet);
        Task<bool> DeletePetAsync(int id);
        Task<bool> AdoptPetAsync(int id);
        Task<(IEnumerable<Pet> pets, int totalCount)> GetAllPetsAsync(int page, int pageSize);
        Task<(IEnumerable<Pet> pets, int totalCount)> SearchPetsAsync(string? name, string? type, bool? adopted, int page, int pageSize);
    }
}
