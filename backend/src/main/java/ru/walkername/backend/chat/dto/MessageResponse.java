package ru.walkername.backend.chat.dto;

import java.time.Instant;

public record MessageResponse(
        Long id,
        Long chatId,
        Long accountId,
        Long userId,
        String firstName,
        String content,
        Instant sentAt
) {
}
