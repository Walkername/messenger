package ru.walkername.backend.common.security;

public record UserPrincipal(
        long accountId,
        String username,
        String role
) {
}
