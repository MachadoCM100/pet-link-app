package com.petlink.service.impl;

import com.petlink.mapper.PetMapper;
import com.petlink.model.dto.PetDto;
import com.petlink.model.entity.Pet;
import com.petlink.repository.PetRepository;
import com.petlink.service.PetService;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class PetServiceImpl implements PetService {

    PetMapper petMapper;
    PetRepository petRepository;

    PetServiceImpl(PetMapper petMapper, PetRepository petRepository) {
        this.petMapper = petMapper;
        this.petRepository = petRepository;
    }

    @Override
    public List<PetDto> getAllPets() {
        List<Pet> petEntities = petRepository.findAll();
        return petMapper.toDtoList(petEntities);
    }

    @Override
    public PetDto getPetById(Long id) {
        Optional<Pet> petOpt = petRepository.findById(id);
        return petOpt.map(petMapper::toDto).orElse(null);
    }

    @Override
    public PetDto addPet(PetDto petDto) {
        Pet pet = petMapper.toEntity(petDto);
        pet = petRepository.save(pet);
        return petMapper.toDto(pet);
    }

    @Override
    public void deletePet(Long id) {
        petRepository.deleteById(id);
    }
}
