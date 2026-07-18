package ru.walkername.backend.friendship.dto;

import java.time.Instant;

public record FriendResponse(
        Long id,
        Long friendId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
