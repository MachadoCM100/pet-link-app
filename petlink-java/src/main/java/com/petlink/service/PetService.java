package com.petlink.service;

import com.petlink.model.Pet;
import java.util.List;

public interface PetService {
    List<Pet> getAllPets();
    Pet getPetById(Long id);
    Pet addPet(Pet pet);
    void deletePet(Long id);
}
