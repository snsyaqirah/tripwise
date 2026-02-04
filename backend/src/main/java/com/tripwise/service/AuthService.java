package com.tripwise.service;

import com.tripwise.dto.auth.LoginRequest;
import com.tripwise.dto.auth.LoginResponse;
import com.tripwise.dto.auth.RegisterRequest;
import com.tripwise.entity.User;
import com.tripwise.exception.InvalidTokenException;
import com.tripwise.exception.UserAlreadyExistsException;
import com.tripwise.repository.UserRepository;
import com.tripwise.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service
 * 
 * Contains business logic for authentication operations
 * 
 * @Service: Marks this as a service layer component
 * @RequiredArgsConstructor: Lombok generates constructor
 * @Transactional: Database operations run in transactions
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Register new user
     * 
     * Steps:
     * 1. Check if email already exists
     * 2. Create new user
     * 3. Hash password with BCrypt
     * 4. Save to database
     * 5. Generate JWT tokens
     * 6. Return response with tokens
     */
    public LoginResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        
        // Hash password - NEVER store plain text passwords!
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        user.setAuthProvider(User.AuthProvider.local);
        user.setIsDeleted(false);  // User is active (not deleted)
        user.setOnboardingCompleted(false);  // User needs to complete onboarding

        // Save to database
        user = userRepository.save(user);

        // Generate JWT tokens
        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        // Return response
        return buildLoginResponse(user, accessToken, refreshToken);
    }

    /**
     * Login existing user
     * 
     * Steps:
     * 1. Authenticate with Spring Security
     * 2. Load user from database
     * 3. Generate JWT tokens
     * 4. Return response with tokens
     */
    public LoginResponse login(LoginRequest request) {
        // Authenticate user with Spring Security
        // This will throw exception if credentials are invalid
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Load user from database
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Generate JWT tokens
        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        // Return response
        return buildLoginResponse(user, accessToken, refreshToken);
    }

    /**
     * Build login response
     * 
     * Helper method to create LoginResponse DTO
     */
    private LoginResponse buildLoginResponse(User user, String accessToken, String refreshToken) {
        // Create user DTO (don't expose password!)
        LoginResponse.UserDto userDto = new LoginResponse.UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setAvatar(user.getAvatar());
        userDto.setCountry(user.getCountry());
        userDto.setCurrency(user.getCurrency());
        userDto.setOnboardingCompleted(user.getOnboardingCompleted());
        userDto.setAuthProvider(user.getAuthProvider().name());

        // Create response
        LoginResponse response = new LoginResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(3600000L);  // 1 hour in milliseconds
        response.setUser(userDto);

        return response;
    }

    /**
     * Refresh access token
     * 
     * When access token expires, use refresh token to get new access token
     */
    public LoginResponse refreshToken(String refreshToken) {
        // Extract email from refresh token
        String email = jwtUtil.extractUsername(refreshToken);
        
        // Load user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Validate refresh token
        if (!jwtUtil.validateToken(refreshToken, user)) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(user);

        // Return response
        return buildLoginResponse(user, newAccessToken, refreshToken);
    }
}
