package ru.walkername.backend.user.dto;

import java.time.Instant;

public record ProfileResponse(
        Long id,
        String firstName,
        Instant createdAt,
        Instant updatedAt
) {
}
