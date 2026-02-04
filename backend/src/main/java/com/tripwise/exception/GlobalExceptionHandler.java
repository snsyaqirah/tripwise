package com.tripwise.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler
 * 
 * Catches exceptions from all controllers and returns consistent error responses
 * 
 * @RestControllerAdvice: Applies to all @RestController classes
 *   - Combines @ControllerAdvice and @ResponseBody
 *   - Allows centralized exception handling
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Error response structure
     * 
     * Consistent format for all error responses
     */
    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            String message,
            HttpStatus status,
            Map<String, String> errors
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        if (errors != null && !errors.isEmpty()) {
            body.put("errors", errors);
        }
        return new ResponseEntity<>(body, status);
    }

    /**
     * Handle validation errors
     * 
     * When @Valid fails on request body (e.g., missing email, short password)
     * 
     * Returns 400 Bad Request with field errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex
    ) {
        Map<String, String> errors = new HashMap<>();
        
        // Extract field errors
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return buildErrorResponse(
                "Validation failed",
                HttpStatus.BAD_REQUEST,
                errors
        );
    }

    /**
     * Handle user already exists
     * 
     * When trying to register with existing email
     * 
     * Returns 409 Conflict
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExists(
            UserAlreadyExistsException ex
    ) {
        return buildErrorResponse(
                ex.getMessage(),
                HttpStatus.CONFLICT,
                null
        );
    }

    /**
     * Handle invalid credentials
     * 
     * When login fails due to wrong email/password
     * 
     * Returns 401 Unauthorized
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex
    ) {
        return buildErrorResponse(
                "Invalid email or password",
                HttpStatus.UNAUTHORIZED,
                null
        );
    }

    /**
     * Handle user not found
     * 
     * When email doesn't exist in database
     * 
     * Returns 404 Not Found
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(
            UsernameNotFoundException ex
    ) {
        return buildErrorResponse(
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                null
        );
    }

    /**
     * Handle invalid token
     * 
     * When JWT is invalid or expired
     * 
     * Returns 401 Unauthorized
     */
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidToken(
            InvalidTokenException ex
    ) {
        return buildErrorResponse(
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED,
                null
        );
    }

    /**
     * Handle all other exceptions
     * 
     * Catch-all for unexpected errors
     * 
     * Returns 500 Internal Server Error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex
    ) {
        // Log the exception for debugging
        ex.printStackTrace();
        
        return buildErrorResponse(
                "An unexpected error occurred",
                HttpStatus.INTERNAL_SERVER_ERROR,
                null
        );
    }
}
