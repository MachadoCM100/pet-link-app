package com.petlink.service.impl;

import com.petlink.model.Pet;
import com.petlink.service.PetService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PetServiceImpl implements PetService {
    private final Map<Long, Pet> pets = new HashMap<>();
    private long nextId = 1;

    public List<Pet> getAllPets() {
        return new ArrayList<>(pets.values());
    }

    public Pet getPetById(Long id) {
        return pets.get(id);
    }

    public Pet addPet(Pet pet) {
        pet.setId(nextId++);
        pets.put(pet.getId(), pet);
        return pet;
    }

    public void deletePet(Long id) {
        pets.remove(id);
    }
}
