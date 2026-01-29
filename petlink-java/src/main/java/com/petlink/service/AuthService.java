package com.petlink.service;

import org.springframework.security.core.Authentication;

public interface AuthService {
    Authentication authenticate(String username, String password);
}
