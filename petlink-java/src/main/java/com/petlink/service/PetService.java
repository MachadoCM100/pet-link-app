package com.petlink.service;

import com.petlink.model.dto.PetDto;
import java.util.List;

public interface PetService {
    List<PetDto> getAllPets();
    PetDto getPetById(Long id);
    PetDto addPet(PetDto petDto);
    void deletePet(Long id);
}
