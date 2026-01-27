package com.petlink.controller.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public abstract class BaseController {
    protected <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, data, null));
    }

    protected ResponseEntity<ApiResponse<Object>> error(final String message, final HttpStatus status) {
        return ResponseEntity.status(status).body(new ApiResponse<>(false, null, message));
    }
}