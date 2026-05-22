package ru.walkername.backend.common.security;

public record UserPrincipal(
        long userId,
        String username,
        String role
) {
}
