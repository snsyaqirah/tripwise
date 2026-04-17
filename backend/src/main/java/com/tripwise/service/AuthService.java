package com.tripwise.service;

import com.tripwise.dto.auth.*;
import com.tripwise.entity.EmailVerificationCode;
import com.tripwise.entity.User;
import com.tripwise.exception.InvalidTokenException;
import com.tripwise.exception.UserAlreadyExistsException;
import com.tripwise.repository.EmailVerificationCodeRepository;
import com.tripwise.repository.UserRepository;
import com.tripwise.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationCodeRepository codeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @Value("${app.email.verification-expiry-minutes}")
    private int codeExpiryMinutes;

    private static final SecureRandom RANDOM = new SecureRandom();

    // ── Step 1: Initiate signup ───────────────────────────────────────────────

    public MessageResponse initiateSignup(InitiateSignupRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // If a fully-verified account exists, reject
        userRepository.findByEmail(email).ifPresent(existing -> {
            if (Boolean.TRUE.equals(existing.getEmailVerified())) {
                throw new UserAlreadyExistsException("An account with this email already exists.");
            }
        });

        sendOtp(email, "signup");
        return new MessageResponse("Verification code sent to " + email);
    }

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────

    public VerifyEmailResponse verifyEmail(VerifyEmailRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        validateOtp(email, request.getCode(), request.getPurpose());

        // Mark all previous codes as used
        codeRepository.markAllUsedByEmailAndPurpose(email, request.getPurpose());

        // Issue a short-lived verification token
        String verificationToken = jwtUtil.generateVerificationToken(email, request.getPurpose());
        return new VerifyEmailResponse(verificationToken, "Email verified successfully.");
    }

    // ── Step 3: Complete signup ───────────────────────────────────────────────

    public LoginResponse completeSignup(CompleteSignupRequest request) {
        String token = request.getVerificationToken();

        if (!jwtUtil.isVerificationToken(token)) {
            throw new InvalidTokenException("Invalid or expired verification token.");
        }

        String purpose = jwtUtil.extractCustomClaim(token, "purpose");
        if (!"signup".equals(purpose)) {
            throw new InvalidTokenException("Token is not valid for signup.");
        }

        String email = jwtUtil.extractUsername(token);

        // Create or update stub account
        User user = userRepository.findByEmail(email)
                .orElse(User.builder()
                        .email(email)
                        .authProvider(User.AuthProvider.local)
                        .build());

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new UserAlreadyExistsException("Account already exists. Please log in.");
        }

        user.setName(request.getName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(true);
        user.setIsDeleted(false);
        user.setOnboardingCompleted(false);

        user = userRepository.save(user);

        return buildLoginResponse(user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadCredentialsException("Email not verified. Please complete signup first.");
        }

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new BadCredentialsException("Account is disabled.");
        }

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }

        return buildLoginResponse(user);
    }

    // ── Forgot password ───────────────────────────────────────────────────────

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        userRepository.findByEmail(email)
                .filter(u -> Boolean.TRUE.equals(u.getEmailVerified()))
                .orElseThrow(() -> new UsernameNotFoundException("No verified account found for this email."));

        sendOtp(email, "forgot_password");
        return new MessageResponse("Password reset code sent to " + email);
    }

    // ── Reset password ────────────────────────────────────────────────────────

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String token = request.getVerificationToken();

        if (!jwtUtil.isVerificationToken(token)) {
            throw new InvalidTokenException("Invalid or expired verification token.");
        }

        String purpose = jwtUtil.extractCustomClaim(token, "purpose");
        if (!"forgot_password".equals(purpose)) {
            throw new InvalidTokenException("Token is not valid for password reset.");
        }

        String email = jwtUtil.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("Password reset successfully. You can now log in.");
    }

    // ── Refresh token ─────────────────────────────────────────────────────────

    public LoginResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        if (!jwtUtil.validateToken(refreshToken, user)) {
            throw new InvalidTokenException("Invalid or expired refresh token.");
        }

        return buildLoginResponse(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void sendOtp(String email, String purpose) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        EmailVerificationCode record = EmailVerificationCode.builder()
                .email(email)
                .code(code)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(codeExpiryMinutes))
                .build();

        codeRepository.save(record);
        emailService.sendVerificationCode(email, code, purpose);
    }

    private void validateOtp(String email, String code, String purpose) {
        EmailVerificationCode record = codeRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new InvalidTokenException("No active code found. Please request a new one."));

        if (record.isExpired()) {
            throw new InvalidTokenException("Code has expired. Please request a new one.");
        }

        if (!record.getCode().equals(code)) {
            throw new InvalidTokenException("Incorrect code. Please try again.");
        }
    }

    LoginResponse buildLoginResponse(User user) {
        String accessToken  = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);

        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .authProvider(user.getAuthProvider().name())
                .country(user.getCountry())
                .currency(user.getCurrency())
                .onboardingCompleted(user.getOnboardingCompleted())
                .build();

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtUtil.getExpirationTime())
                .user(userDto)
                .build();
    }
}
