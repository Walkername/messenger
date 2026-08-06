package ru.walkername.backend.friendship.dto;

import java.time.Instant;

public record IncomingRequestResponse(
        Long id,
        Long subscriberId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt,
        boolean online
) {
}
