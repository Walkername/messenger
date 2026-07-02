package ru.walkername.backend.auth.dto;

public record AuthTokens(
        String accessToken,
        String refreshToken
) {
}
