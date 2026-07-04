package ru.walkername.backend.auth.exception;

public class DuplicateRefreshTokenUpdateException extends RuntimeException {
    public DuplicateRefreshTokenUpdateException(String message) {
        super(message);
    }
}
