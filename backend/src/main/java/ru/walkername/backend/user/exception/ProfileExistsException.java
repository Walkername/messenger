package ru.walkername.backend.user.exception;

public class ProfileExistsException extends RuntimeException {
    public ProfileExistsException(String message) {
        super(message);
    }
}
