package ru.walkername.backend.chat.dto;

import java.time.Instant;

public record ChatParticipantResponse(
        Long chatId,
        Long accountId,
        Long profileId,
        String username,
        String firstName,
        Instant joinedAt,
        boolean online
) {
}
