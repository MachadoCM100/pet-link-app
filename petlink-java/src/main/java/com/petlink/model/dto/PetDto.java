package com.petlink.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PetDto {
    private Long id;

    @NotBlank
    @Size(min = 2, max = 50)
    private String name;

    @NotBlank
    @Size(min = 2, max = 30)
    private String type;

    @Min(0)
    @Max(100)
    private int age;

    private String description;
    private boolean adopted;
    private String createdAt;

    public PetDto(String name, String type, int age, String description, boolean adopted, String createdAt) {
        this.name = name;
        this.type = type;
        this.age = age;
        this.description = description;
        this.adopted = adopted;
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "PetDto{" +
                "name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", age=" + age +
                ", description='" + description + '\'' +
                ", adopted=" + adopted +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
