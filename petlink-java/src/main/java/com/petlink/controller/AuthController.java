package com.petlink.controller;

import com.petlink.controller.common.ApiResponse;
import com.petlink.controller.common.BaseController;
import com.petlink.model.dto.AuthRequest;
import com.petlink.model.dto.AuthResponse;
import com.petlink.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController extends BaseController {

    private final AuthService authService;

    @Autowired
    public AuthController(final AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authService.authenticate(request.getUsername(), request.getPassword());
            String token = authService.generateJwtToken(authentication);
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setUsername(authentication.getName());
            return success(response);
        } catch (AuthenticationException ex) {
            return error("Invalid credentials", org.springframework.http.HttpStatus.UNAUTHORIZED);
        }
    }
}
