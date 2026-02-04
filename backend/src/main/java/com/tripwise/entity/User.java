package com.tripwise.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;

/**
 * User entity representing the users table in database
 * 
 * Key annotations:
 * - @Entity: Marks this class as a JPA entity
 * - @Table: Maps to the "users" table
 * - @Data: Lombok annotation - generates getters, setters, toString, equals, hashCode
 * - @Builder: Lombok annotation - provides builder pattern for object creation
 * - @NoArgsConstructor: Generates no-argument constructor (required by JPA)
 * - @AllArgsConstructor: Generates constructor with all fields
 * 
 * implements UserDetails: Required by Spring Security for authentication
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    /**
     * Primary key with auto-increment (1, 2, 3...)
     * GenerationType.IDENTITY uses database BIGSERIAL auto-increment
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    /**
     * User's full name
     * - nullable = false: NOT NULL constraint
     * - length = 100: VARCHAR(100)
     */
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * User's email (used as username for login)
     * - unique = true: UNIQUE constraint
     */
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /**
     * Hashed password (never store plain passwords!)
     * Will be hashed using BCryptPasswordEncoder
     */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    /**
     * Avatar URL (optional)
     */
    @Column(length = 500)
    private String avatar;

    /**
     * Authentication provider type
     * - @Enumerated(EnumType.STRING): Store enum as string in DB (more readable)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.local;

    /**
     * Google ID for OAuth users (nullable for local users)
     */
    @Column(name = "google_id", unique = true)
    private String googleId;

    /**
     * User's country (for personalization)
     */
    @Column(length = 100)
    private String country;

    /**
     * Preferred currency
     */
    @Column(length = 3)
    private String currency;

    /**
     * Whether user completed onboarding
     */
    @Column(name = "onboarding_completed")
    @Builder.Default
    private Boolean onboardingCompleted = false;

    /**
     * Soft delete flag: false = active, true = deleted
     */
    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    /**
     * Timestamps for auditing
     * - @Column(updatable = false): createdAt won't change after insert
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Password reset token (for forgot password feature)
     */
    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private LocalDateTime passwordResetExpires;

    /**
     * Automatically set timestamps before persist
     * @PrePersist runs before entity is first saved to database
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Automatically update timestamp before update
     * @PreUpdate runs before entity is updated in database
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ========== UserDetails implementation (required by Spring Security) ==========

    /**
     * Returns authorities (roles/permissions)
     * We're keeping it simple - all users have same permissions
     * In real app, you might have ROLE_USER, ROLE_ADMIN, etc.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    /**
     * Returns the password (Spring Security will verify it)
     */
    @Override
    public String getPassword() {
        return passwordHash;
    }

    /**
     * Returns username (we use email as username)
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Account non-expired check
     * Return true = account never expires
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Account non-locked check
     * Return true = account never gets locked
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Credentials non-expired check
     * Return true = password never expires
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Account enabled check
     * Check if user is not deleted
     */
    @Override
    public boolean isEnabled() {
        return !isDeleted;
    }

    /**
     * Enum for authentication providers
     */
    public enum AuthProvider {
        local,   // Email/password registration
        google   // Google OAuth
    }
}
