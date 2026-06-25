package ru.walkername.backend.auth.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.walkername.backend.auth.dto.AuthRequest;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.exception.AccountExistsException;
import ru.walkername.backend.auth.exception.InvalidCredentialsException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.common.security.TokenService;
import ru.walkername.backend.profile.service.ProfileService;

import java.security.SecureRandom;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthRepository authRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private ProfileService profileService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenService tokenService;

    @Mock
    private SecureRandom secureRandom;

    @InjectMocks
    private AuthService authService;

    @Test
    public void shouldReturnAccountByRegister() {
        AuthRequest authRequest = new AuthRequest("user123", "password123");

        when(authRepository.save(any(Account.class))).thenAnswer(invocation -> {
            Account createdAccount = invocation.getArgument(0);
            createdAccount.setId(1L);
            createdAccount.setUsername("user123");
            createdAccount.setPasswordHash("password123Hash");
            return createdAccount;
        });

        Account result = authService.register(authRequest);

        assertEquals(1L, result.getId());
        assertEquals("user123",  result.getUsername());
        assertEquals("password123Hash", result.getPasswordHash());

        verify(authRepository).save(any(Account.class));
    }

    @Test
    public void shouldThrowExceptionWhenAccountExistsByRegister() {
        AuthRequest authRequest = new AuthRequest("user123", "password123Hash");

        when(authRepository.existsByUsername("user123")).thenReturn(true);

        assertThrows(
                AccountExistsException.class,
                () -> authService.register(authRequest)
        );
    }

    @Test
    public void shouldReturnJwtResponseByLogin() {
        AuthRequest authRequest = new AuthRequest("user123", "password123");

        Account account = new Account();
        account.setId(1L);
        account.setUsername("user123");
        account.setPasswordHash("password123Hash");

        when(authRepository.findByUsername(authRequest.username())).thenReturn(Optional.of(account));
        when(passwordEncoder.matches(authRequest.password(), account.getPasswordHash())).thenReturn(true);

        JWTResponse jwtResponse = new JWTResponse("accessToken", "refreshToken");
        when(tokenService.generateTokensPair(account)).thenReturn(jwtResponse);

        JWTResponse result = authService.login(authRequest);

        assertNotNull(result);
        assertNotEquals(null, result.accessToken());
        assertNotEquals(null, result.refreshToken());

        verify(authRepository).findByUsername(authRequest.username());
        verify(passwordEncoder).matches(authRequest.password(), account.getPasswordHash());
        verify(tokenService).generateTokensPair(account);
    }

    @Test
    public void shouldThrowExceptionWhenInvalidUsernameByLogin() {
        AuthRequest authRequest = new AuthRequest("user123", "password123");

        when(authRepository.findByUsername(authRequest.username())).thenReturn(Optional.empty());

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(authRequest)
        );

        verify(authRepository).findByUsername(authRequest.username());
    }

    @Test
    public void shouldThrowExceptionWhenInvalidPasswordByLogin() {
        AuthRequest authRequest = new AuthRequest("user123", "password123");

        Account dbAccount = new Account();
        dbAccount.setId(1L);
        dbAccount.setUsername("user123");
        dbAccount.setPasswordHash("password123Hash");

        when(authRepository.findByUsername(authRequest.username())).thenReturn(Optional.of(dbAccount));
        when(passwordEncoder.matches(authRequest.password(),  dbAccount.getPasswordHash())).thenReturn(false);

        assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(authRequest)
        );

        verify(authRepository).findByUsername(authRequest.username());
        verify(passwordEncoder).matches(authRequest.password(), dbAccount.getPasswordHash());
    }

}
