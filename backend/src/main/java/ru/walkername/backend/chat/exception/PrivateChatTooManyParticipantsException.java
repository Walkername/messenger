package ru.walkername.backend.chat.exception;

public class PrivateChatTooManyParticipantsException extends RuntimeException {
    public PrivateChatTooManyParticipantsException(String message) {
        super(message);
    }
}
