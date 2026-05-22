package ru.walkername.backend.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.auth.dto.AuthRequest;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.entity.AccountRole;
import ru.walkername.backend.auth.entity.RefreshToken;
import ru.walkername.backend.auth.exception.AccountExistsException;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.exception.InvalidCredentialsException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.auth.repository.RefreshTokenRepository;
import ru.walkername.backend.common.security.TokenService;
import ru.walkername.backend.user.entity.User;
import ru.walkername.backend.user.service.UserService;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public Account register(AuthRequest request) {
        if (authRepository.existsByUsername(request.username())) {
            log.warn("Registration attempt for existing username: {}", request.username());
            throw new AccountExistsException("Account with such username already exists");
        }
        Account account = new Account(
                request.username(),
                passwordEncoder.encode(request.password()),
                AccountRole.USER,
                Instant.now(),
                Instant.now()
        );
        Account createdAccount = authRepository.save(account);

        User user = new User();
        user.setAccount(createdAccount);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userService.save(user);

        log.debug("Account registered successfully: {}", account.getUsername());

        return createdAccount;
    }

    @Transactional
    public JWTResponse login(AuthRequest request) {
        Account dbAccount = checkAndGet(request);

        JWTResponse jwtResponse = tokenService.generateTokensPair(dbAccount);

        refreshTokenService.update(dbAccount.getId(), jwtResponse.refreshToken());

        log.debug("Account successfully authenticated: {}", dbAccount.getUsername());

        return jwtResponse;
    }

    private Account checkAndGet(AuthRequest request) {
        Account dbAccount = authRepository.findByUsername(request.username())
                .orElseThrow(() -> {
                    log.warn("Login attempt with non-existing username: {}", request.username());
                    return new InvalidCredentialsException("Wrong credentials");
                });

        if (!passwordEncoder.matches(request.password(), dbAccount.getPasswordHash())) {
            log.warn("Invalid password attempt for username: {}", request.username());
            throw new InvalidCredentialsException("Wrong credentials");
        }

        return dbAccount;
    }

}
