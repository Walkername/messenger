package ru.walkername.backend.chat.dto;

import java.time.Instant;

public record ParticipantResponse(
        Long chatId,
        Long accountId,
        Long userId,
        String username,
        String firstName,
        Instant joinedAt
) {
}
