package com.tripwise.controller;

import com.tripwise.dto.auth.LoginRequest;
import com.tripwise.dto.auth.LoginResponse;
import com.tripwise.dto.auth.RegisterRequest;
import com.tripwise.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * 
 * REST API endpoints for authentication
 * 
 * @RestController: Marks this as REST controller
 *   - Combines @Controller and @ResponseBody
 *   - Returns JSON automatically
 * 
 * @RequestMapping: Base path for all endpoints
 * @RequiredArgsConstructor: Lombok generates constructor
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register new user
     * 
     * POST /api/auth/register
     * 
     * @Valid: Validates request body against constraints in RegisterRequest
     * @RequestBody: Tells Spring to parse JSON from request body
     * 
     * Returns 201 Created on success
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Login user
     * 
     * POST /api/auth/login
     * 
     * Returns 200 OK with JWT tokens
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh access token
     * 
     * POST /api/auth/refresh
     * 
     * @RequestHeader: Extracts value from HTTP header
     * 
     * Returns new access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestHeader("Authorization") String authHeader
    ) {
        // Extract token from "Bearer <token>"
        String refreshToken = authHeader.substring(7);
        
        LoginResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     * 
     * GET /api/auth/health
     * 
     * Used to verify server is running
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
