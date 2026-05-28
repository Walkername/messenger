package ru.walkername.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token should not be null, empty or blank")
        String token
) {
}
