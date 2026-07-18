package ru.walkername.backend.friendship.dto;

import java.time.Instant;

public record OutgoingRequestResponse(
        Long id,
        Long targetId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
