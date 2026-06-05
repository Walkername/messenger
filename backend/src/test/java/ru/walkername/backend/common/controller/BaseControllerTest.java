package ru.walkername.backend.common.controller;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import ru.walkername.backend.common.security.UserPrincipal;

import java.util.List;

public abstract class BaseControllerTest {

    protected void setUser(UserPrincipal user) {
        UserPrincipal principal = new UserPrincipal(user.accountId(), user.username(), user.role());

        var auth = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority(user.role()))
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }
}
