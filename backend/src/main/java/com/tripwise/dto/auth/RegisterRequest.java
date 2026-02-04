package com.tripwise.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) for registration request
 * 
 * DTOs are used to transfer data between client and server
 * They are separate from entities to:
 * 1. Control what data is exposed to clients
 * 2. Add validation rules
 * 3. Decouple API from database structure
 * 
 * Validation annotations from jakarta.validation:
 * - @NotBlank: Field cannot be null, empty, or only whitespace
 * - @Email: Must be valid email format
 * - @Size: Min/max length constraints
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
