package ru.walkername.backend.chat.dto;

import ru.walkername.backend.chat.entity.ChatType;

import java.time.Instant;

public record ChatResponse(
        Long id,
        String name,
        ChatType type,
        Instant createdAt,
        String lastMessage,
        Instant lastMessageAt
) {
}
