package ru.walkername.backend.auth.exception;

public class RefreshTokenCookieNotFoundException extends RuntimeException {
    public RefreshTokenCookieNotFoundException(String message) {
        super(message);
    }
}
