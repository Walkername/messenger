package ru.walkername.backend.common.exception;

public class WebSocketAccessDeniedException extends RuntimeException {
    public WebSocketAccessDeniedException(String message) {
        super(message);
    }
}
