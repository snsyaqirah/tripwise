package com.tripwise.exception;

/**
 * Custom exception for invalid or expired JWT tokens
 */
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}
