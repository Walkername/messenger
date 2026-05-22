package ru.walkername.backend.auth.dto;

public record AuthRequest(
        String username,
        String password
) {
}
