package com.petlink.controller;

import com.petlink.model.AuthRequest;
import com.petlink.model.AuthResponse;
import com.petlink.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(final AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        if (authService.validateUser(request.getUsername(), request.getPassword())) {
            AuthResponse response = new AuthResponse();
            response.setToken("dummy-jwt-token"); // Replace with real JWT
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).build();
    }
}
