package ru.walkername.backend.friendship.dto;

import java.time.Instant;

public record FriendshipResponse(
        Long id,
        Long subscriberId,
        Long targetId,
        String username,
        String firstname,
        Instant createdAt,
        Instant updatedAt
) {
}
