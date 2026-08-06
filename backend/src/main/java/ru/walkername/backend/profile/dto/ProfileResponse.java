package ru.walkername.backend.profile.dto;

import java.time.Instant;

public record ProfileResponse(
        Long accountId,
        Long profileId,
        String username,
        String firstName,
        Instant createdAt,
        Instant updatedAt,
        boolean online
) {
}
