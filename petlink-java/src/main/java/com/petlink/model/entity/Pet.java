package com.petlink.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pets")
@Getter
@Setter
@NoArgsConstructor
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false)
    private int age;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean adopted;

    @Column(nullable = false, length = 30)
    private String createdAt;
}
