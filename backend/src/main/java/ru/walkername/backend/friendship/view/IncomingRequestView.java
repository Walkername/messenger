package ru.walkername.backend.friendship.view;

import java.time.Instant;

public record IncomingRequestView(
        Long id,
        Long subscriberId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
