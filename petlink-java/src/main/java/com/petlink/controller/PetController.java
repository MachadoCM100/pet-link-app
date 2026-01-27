package com.petlink.controller;

import com.petlink.controller.common.ApiResponse;
import com.petlink.controller.common.BaseController;
import com.petlink.model.Pet;
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
    public ResponseEntity<ApiResponse<List<Pet>>> getAllPets() {
        return success(petService.getAllPets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getPetById(@PathVariable Long id) {
        Pet pet = petService.getPetById(id);
        if (pet != null) {
            return success(pet);
        } else {
            return error("Pet not found", org.springframework.http.HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Pet>> addPet(@Valid @RequestBody Pet pet) {
        return success(petService.addPet(pet));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return success(null);
    }
}