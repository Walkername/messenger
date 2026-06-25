package ru.walkername.backend.profile.view;

import java.time.Instant;

public record ProfileView(
        Long accountId,
        Long profileId,
        String username,
        String firstName,
        Instant createdAt,
        Instant updatedAt
) {
}
