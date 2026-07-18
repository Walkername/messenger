package ru.walkername.backend.friendship.view;

import java.time.Instant;

public record OutgoingRequestView(
        Long id,
        Long targetId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
