using PetLink.API.Interfaces;
using PetLink.API.Models;
using PetLink.API.Configuration;
using PetLink.API.Helpers;
using Microsoft.Extensions.Options;

namespace PetLink.API.Services
{
    public class PetService : IPetService
    {
        private readonly ValidationSettings _validationSettings;
        private readonly ErrorMessages _errorMessages;

        // In-memory storage for demo purposes
        // In a real application, this would be replaced with a database context
        private static readonly List<Pet> _pets = new()
        {
            new Pet { Id = 1, Name = "Fluffy", Type = "Cat", Adopted = false, CreatedAt = DateTime.UtcNow.AddDays(-10), Description = "A friendly orange cat", Age = 3 },
            new Pet { Id = 2, Name = "Rover", Type = "Dog", Adopted = true, CreatedAt = DateTime.UtcNow.AddDays(-15), Description = "A loyal golden retriever", Age = 5 },
            new Pet { Id = 3, Name = "Buddy", Type = "Dog", Adopted = false, CreatedAt = DateTime.UtcNow.AddDays(-5), Description = "A playful beagle", Age = 2 },
            new Pet { Id = 4, Name = "Whiskers", Type = "Cat", Adopted = false, CreatedAt = DateTime.UtcNow.AddDays(-8), Description = "A calm siamese cat", Age = 4 }
        };

        private static int _nextId = 5;

        public PetService(IOptions<ValidationSettings> validationSettings, IOptions<ErrorMessages> errorMessages)
        {
            _validationSettings = validationSettings.Value;
            _errorMessages = errorMessages.Value;
        }

        public Task<IEnumerable<Pet>> GetAllPetsAsync()
        {
            return Task.FromResult(_pets.AsEnumerable());
        }

        public Task<(IEnumerable<Pet> pets, int totalCount)> GetAllPetsAsync(int page, int pageSize)
        {
            ValidationHelper.ValidatePagination(page, pageSize, _validationSettings.Pagination);

            var totalCount = _pets.Count;
            var pets = _pets
                .OrderBy(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsEnumerable();

            return Task.FromResult((pets, totalCount));
        }

        public Task<Pet?> GetPetByIdAsync(int id)
        {
            ValidationHelper.ValidateId(id, "Pet ID");

            var pet = _pets.FirstOrDefault(p => p.Id == id);
            return Task.FromResult(pet);
        }

        public Task<Pet> CreatePetAsync(Pet pet)
        {
            if (pet == null)
                throw new ValidationException("Pet data is required");

            // Business logic validation using configuration
            ValidationHelper.ValidatePetBusinessRules(pet, _validationSettings.Pet, _errorMessages);

            // Check for duplicate names
            if (_pets.Any(p => p.Name.Equals(pet.Name, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException(_errorMessages.Pet.DuplicateName);

            pet.Id = _nextId++;
            pet.CreatedAt = DateTime.UtcNow;
            _pets.Add(pet);
            return Task.FromResult(pet);
        }

        public Task<Pet?> UpdatePetAsync(int id, Pet updatedPet)
        {
            ValidationHelper.ValidateId(id, "Pet ID");

            if (updatedPet == null)
                throw new ValidationException("Pet data is required");

            var existingPet = _pets.FirstOrDefault(p => p.Id == id);
            if (existingPet == null)
                return Task.FromResult<Pet?>(null);

            // Business logic validation using configuration
            ValidationHelper.ValidatePetBusinessRules(updatedPet, _validationSettings.Pet, _errorMessages);

            // Check for duplicate names (excluding current pet)
            if (_pets.Any(p => p.Id != id && p.Name.Equals(updatedPet.Name, StringComparison.OrdinalIgnoreCase)))
                throw new ConflictException(_errorMessages.Pet.DuplicateName);

            existingPet.Name = updatedPet.Name;
            existingPet.Type = updatedPet.Type;
            existingPet.Description = updatedPet.Description;
            existingPet.Age = updatedPet.Age;
            // Don't update Adopted status or CreatedAt here

            return Task.FromResult<Pet?>(existingPet);
        }

        public Task<bool> DeletePetAsync(int id)
        {
            ValidationHelper.ValidateId(id, "Pet ID");

            var pet = _pets.FirstOrDefault(p => p.Id == id);
            if (pet == null)
                return Task.FromResult(false);

            if (pet.Adopted)
                throw new BusinessLogicException(_errorMessages.Pet.CannotDeleteAdopted);

            _pets.Remove(pet);
            return Task.FromResult(true);
        }

        public Task<bool> AdoptPetAsync(int id)
        {
            ValidationHelper.ValidateId(id, "Pet ID");

            var pet = _pets.FirstOrDefault(p => p.Id == id);
            if (pet == null)
                return Task.FromResult(false);

            if (pet.Adopted)
                throw new BusinessLogicException(_errorMessages.Pet.AlreadyAdopted);

            pet.Adopted = true;
            return Task.FromResult(true);
        }

        public Task<(IEnumerable<Pet> pets, int totalCount)> SearchPetsAsync(string? name, string? type, bool? adopted, int page, int pageSize)
        {
            ValidationHelper.ValidatePagination(page, pageSize, _validationSettings.Pagination);

            var query = _pets.AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(p => p.Name.Contains(name, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrEmpty(type))
                query = query.Where(p => p.Type.Equals(type, StringComparison.OrdinalIgnoreCase));

            if (adopted.HasValue)
                query = query.Where(p => p.Adopted == adopted.Value);

            var totalCount = query.Count();
            var pets = query
                .OrderBy(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .AsEnumerable();

            return Task.FromResult((pets, totalCount));
        }
    }
}
