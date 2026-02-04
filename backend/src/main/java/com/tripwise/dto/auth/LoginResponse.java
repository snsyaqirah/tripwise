package com.tripwise.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for login response
 * Contains JWT token and user information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private Long expiresIn;  // Token expiration in milliseconds
    private UserDto user;

    /**
     * Nested DTO for user information
     * Only include non-sensitive data!
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String avatar;
        private String authProvider;
        private String country;
        private String currency;
        private Boolean onboardingCompleted;
        private String createdAt;
        private String updatedAt;
    }
}
