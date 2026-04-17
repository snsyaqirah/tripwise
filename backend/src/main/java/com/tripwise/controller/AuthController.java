package com.tripwise.controller;

import com.tripwise.dto.auth.*;
import com.tripwise.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Auth flow
 *
 * Email sign-up (3 steps):
 *   POST /api/auth/initiate-signup   { email }                          → sends OTP
 *   POST /api/auth/verify-email      { email, code, purpose:"signup" }  → returns verificationToken
 *   POST /api/auth/complete-signup   { verificationToken, name, pass }  → account created, returns JWT
 *
 * Login:
 *   POST /api/auth/login             { email, password }                → returns JWT
 *
 * Forgot password (2 steps):
 *   POST /api/auth/forgot-password   { email }                          → sends OTP
 *   POST /api/auth/verify-email      { email, code, purpose:"forgot_password" } → returns verificationToken
 *   POST /api/auth/reset-password    { email, verificationToken, newPassword }  → password updated
 *
 * Token management:
 *   POST /api/auth/refresh           Authorization: Bearer <refreshToken>
 *
 * Google OAuth (Spring handles the redirect automatically):
 *   GET  /oauth2/authorization/google   → Google login page
 *   (success handler redirects to frontend with JWT)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Step 1 – send OTP to email */
    @PostMapping("/initiate-signup")
    public ResponseEntity<MessageResponse> initiateSignup(@Valid @RequestBody InitiateSignupRequest request) {
        return ResponseEntity.ok(authService.initiateSignup(request));
    }

    /** Step 2 – validate OTP (used for both signup and forgot-password flows) */
    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    /** Step 3 (signup) – set name + password, create account */
    @PostMapping("/complete-signup")
    public ResponseEntity<LoginResponse> completeSignup(@Valid @RequestBody CompleteSignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.completeSignup(request));
    }

    /** Login with email + password */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Step 1 (forgot password) – send OTP */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /** Step 3 (forgot password) – set new password using verificationToken from /verify-email */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /** Exchange refresh token for a new access token */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestHeader("Authorization") String authHeader) {
        String refreshToken = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}
