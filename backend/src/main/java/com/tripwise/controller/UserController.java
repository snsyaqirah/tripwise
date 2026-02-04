package com.tripwise.controller;

import com.tripwise.dto.user.UpdateProfileRequest;
import com.tripwise.entity.User;
import com.tripwise.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * User Controller
 * 
 * REST endpoints for user management
 * 
 * All endpoints require authentication (JWT token)
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile
     * 
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String userEmail = authentication.getName();  // JWT subject contains email
        User user = userService.getUserByEmail(userEmail);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user profile (country and currency)
     * Also marks onboarding as completed
     * 
     * PUT /api/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();  // JWT subject contains email
        User updatedUser = userService.updateProfile(userEmail, request);
        return ResponseEntity.ok(updatedUser);
    }
}
