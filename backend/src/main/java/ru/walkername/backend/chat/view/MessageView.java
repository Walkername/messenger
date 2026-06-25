package ru.walkername.backend.chat.view;

import java.time.Instant;

public record MessageView(
        Long id,
        Long chatId,
        Long accountId,
        String username,
        String content,
        Instant sentAt
) {
}
