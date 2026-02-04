package com.tripwise.security;

import com.tripwise.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter
 * 
 * This filter runs on EVERY request to check if JWT token is valid
 * 
 * Extends OncePerRequestFilter: Ensures filter runs once per request
 * (even if request is forwarded internally)
 * 
 * @RequiredArgsConstructor: Lombok generates constructor for final fields
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * Main filter method - runs for every HTTP request
     * 
     * Flow:
     * 1. Extract JWT from Authorization header
     * 2. Validate token
     * 3. Load user from database
     * 4. Set authentication in SecurityContext
     * 5. Continue filter chain
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Get Authorization header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No token - continue to next filter
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extract token (remove "Bearer " prefix)
        jwt = authHeader.substring(7);
        
        // Validate token
        try {
            // 3. Extract username from token
            userEmail = jwtUtil.extractUsername(jwt);

            // 4. If username exists and user is not already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // 5. Load user details from database
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // 6. Validate token
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    
                    // 7. Create authentication object
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,  // credentials (not needed after authentication)
                            userDetails.getAuthorities()
                    );

                    // 8. Set additional details from request
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 9. Set authentication in SecurityContext
                    // This tells Spring Security that user is authenticated
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is invalid or expired - do nothing
            // User will remain unauthenticated
            logger.error("Cannot set user authentication", e);
        }

        // 10. Continue to next filter
        filterChain.doFilter(request, response);
    }
}
