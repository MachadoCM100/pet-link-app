package com.petlink.controller;

import com.petlink.controller.common.ApiResponse;
import com.petlink.controller.common.BaseController;
import com.petlink.model.dto.PetDto;
import com.petlink.service.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController extends BaseController {

    private final PetService petService;

    @Autowired
    public PetController(final PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PetDto>>> getAllPets() {
        return success(petService.getAllPets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getPetById(@PathVariable Long id) {
        PetDto petDto = petService.getPetById(id);
        if (petDto != null) {
            return success(petDto);
        } else {
            return error("PetDto not found", org.springframework.http.HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PetDto>> addPet(@Valid @RequestBody PetDto petDto) {
        return success(petService.addPet(petDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return success(null);
    }
}