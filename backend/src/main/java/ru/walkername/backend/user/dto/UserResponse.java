package ru.walkername.backend.user.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String firstName,
        Instant createdAt,
        Instant updatedAt
) {
}
