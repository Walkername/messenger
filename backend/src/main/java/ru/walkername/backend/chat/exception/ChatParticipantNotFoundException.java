package ru.walkername.backend.chat.exception;

public class ChatParticipantNotFoundException extends RuntimeException {
  public ChatParticipantNotFoundException(String message) {
    super(message);
  }
}
