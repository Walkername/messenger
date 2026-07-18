package ru.walkername.backend.friendship.view;

import java.time.Instant;

public record FriendView(
        Long id,
        Long friendId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
