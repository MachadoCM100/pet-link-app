package com.petlink.service.impl;

import com.petlink.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    public boolean validateUser(String username, String password) {
        // Dummy validation for scaffolding
        return "user".equals(username) && "password".equals(password);
    }
}
