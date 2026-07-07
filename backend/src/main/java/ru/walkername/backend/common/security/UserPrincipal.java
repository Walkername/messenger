package ru.walkername.backend.common.security;

import java.security.Principal;

public record UserPrincipal(
        long accountId,
        String username,
        String role
) implements Principal {

    @Override
    public String getName() {
        return String.valueOf(accountId);
    }
}
