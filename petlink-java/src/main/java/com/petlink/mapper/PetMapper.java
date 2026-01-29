package com.petlink.mapper;

import com.petlink.model.dto.PetDto;
import com.petlink.model.entity.Pet;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PetMapper {

    PetDto toDto(Pet pet);
    Pet toEntity(PetDto petDto);
    List<PetDto> toDtoList(List<Pet> pets);
}
