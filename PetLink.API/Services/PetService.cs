using PetLink.API.Interfaces;
using PetLink.API.Models;

namespace PetLink.API.Services
{
    public class PetService : IPetService
    {
        // In-memory storage for demo purposes
        // In a real application, this would be replaced with a database context
        private static readonly List<Pet> _pets = new()
        {
            new Pet { Id = 1, Name = "Fluffy", Type = "Cat", Adopted = false },
            new Pet { Id = 2, Name = "Rover", Type = "Dog", Adopted = true },
            new Pet { Id = 3, Name = "Buddy", Type = "Dog", Adopted = false },
            new Pet { Id = 4, Name = "Whiskers", Type = "Cat", Adopted = false }
        };

        private static int _nextId = 5;

        public Task<IEnumerable<Pet>> GetAllPetsAsync()
        {
            return Task.FromResult(_pets.AsEnumerable());
        }

        public Task<Pet?> GetPetByIdAsync(int id)
        {
            var pet = _pets.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(pet);
        }

        public Task<Pet> CreatePetAsync(Pet pet)
        {
            pet.Id = _nextId++;
            _pets.Add(pet);
            return Task.FromResult(pet);
        }

        public Task<Pet?> UpdatePetAsync(int id, Pet updatedPet)
        {
            var existingPet = _pets.FirstOrDefault(p => p.Id == id);
            if (existingPet == null)
                return Task.FromResult<Pet?>(null);

            existingPet.Name = updatedPet.Name;
            existingPet.Type = updatedPet.Type;
            existingPet.Adopted = updatedPet.Adopted;

            return Task.FromResult<Pet?>(existingPet);
        }

        public Task<bool> DeletePetAsync(int id)
        {
            var pet = _pets.FirstOrDefault(p => p.Id == id);
            if (pet == null)
                return Task.FromResult(false);

            _pets.Remove(pet);
            return Task.FromResult(true);
        }

        public Task<bool> AdoptPetAsync(int id)
        {
            var pet = _pets.FirstOrDefault(p => p.Id == id);
            if (pet == null)
                return Task.FromResult(false);

            pet.Adopted = true;
            return Task.FromResult(true);
        }
    }
}
