package ru.walkername.backend.chat.view;

import java.time.Instant;

public record ChatParticipantView(
        Long chatId,
        Long accountId,
        Long profileId,
        String username,
        String firstName,
        Instant joinedAt
) {
}
