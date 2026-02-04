package com.tripwise.exception;

/**
 * Custom exception for when user email already exists
 * 
 * RuntimeException: Unchecked exception (no need for try-catch)
 */
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
