package ru.walkername.backend.common.exception;

public class InvalidJWTException extends RuntimeException {
    public InvalidJWTException(String message) {
        super(message);
    }
}
