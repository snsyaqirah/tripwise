package com.tripwise.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private Long expiration;

    @Value("${app.jwt.refresh-expiration}")
    private Long refreshExpiration;

    @Value("${app.jwt.verification-expiration}")
    private Long verificationExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ── Token generation ──────────────────────────────────────────────────────

    public String generateToken(UserDetails userDetails) {
        return createToken(new HashMap<>(), userDetails.getUsername(), expiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return createToken(new HashMap<>(), userDetails.getUsername(), refreshExpiration);
    }

    /**
     * Short-lived token (5 min) issued after OTP is validated.
     * Carries "purpose" claim so the complete-signup endpoint can verify intent.
     */
    public String generateVerificationToken(String email, String purpose) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("purpose", purpose);
        claims.put("type", "verification");
        return createToken(claims, email, verificationExpiration);
    }

    private String createToken(Map<String, Object> claims, String subject, Long expirationTime) {
        Date now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Claim extraction ──────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    public String extractCustomClaim(String token, String claimName) {
        return extractClaim(token, claims -> claims.get(claimName, String.class));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Validation ────────────────────────────────────────────────────────────

    public Boolean validateToken(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean isVerificationToken(String token) {
        try {
            return "verification".equals(extractCustomClaim(token, "type"));
        } catch (Exception e) {
            return false;
        }
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Long getExpirationTime() {
        return expiration;
    }
}
