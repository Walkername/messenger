package ru.walkername.backend.profile.exception;

public class ProfileExistsException extends RuntimeException {
    public ProfileExistsException(String message) {
        super(message);
    }
}
