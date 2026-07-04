package ru.walkername.backend.friendship.view;

import java.time.Instant;

public record FriendshipView(
        Long id,
        Long subscriberId,
        Long targetId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
