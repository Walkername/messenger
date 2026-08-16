package ru.walkername.backend.chat.exception;

public class PrivateChatTooFewParticipantsException extends RuntimeException {
    public PrivateChatTooFewParticipantsException(String message) {
        super(message);
    }
}
