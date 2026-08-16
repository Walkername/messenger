package ru.walkername.backend.chat.exception;

public class PrivateChatAlreadyExistsException extends RuntimeException {
    public PrivateChatAlreadyExistsException(String message) {
        super(message);
    }
}
