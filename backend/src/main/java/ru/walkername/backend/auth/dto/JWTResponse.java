package ru.walkername.backend.auth.dto;

public record JWTResponse(
        String accessToken,
        String refreshToken
) {
}
