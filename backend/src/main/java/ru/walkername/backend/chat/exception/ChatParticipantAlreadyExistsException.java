package ru.walkername.backend.chat.exception;

public class ChatParticipantAlreadyExistsException extends RuntimeException {
    public ChatParticipantAlreadyExistsException(String message) {
        super(message);
    }
}
