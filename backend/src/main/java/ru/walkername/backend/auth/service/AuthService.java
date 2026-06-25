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
import ru.walkername.backend.auth.exception.AccountExistsException;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.exception.InvalidCredentialsException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.common.security.TokenService;
import ru.walkername.backend.profile.entity.Profile;
import ru.walkername.backend.profile.mapper.ProfileMapper;
import ru.walkername.backend.profile.service.ProfileService;
import ru.walkername.backend.profile.view.ProfileView;

import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final ProfileService profileService;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;
    private final ProfileMapper profileMapper;

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

        Profile profile = new Profile();
        profile.setAccount(createdAccount);
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        profileService.save(profile);

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

    @Transactional
    public ProfileView updateUsername(Long accountId, String newUsername) {
        Account account = authRepository.findById(accountId).orElseThrow(
                () -> {
                    log.warn("Update username attempt for non-existing account: {}", accountId);
                    return new AccountNotFoundException("Account with such username does not exist");
                }
        );

        if (authRepository.existsByUsername(newUsername)) {
            log.warn("Update username attempt for existing username: {}", newUsername);
            throw new AccountExistsException("Account with such username already exists");
        }

        account.setUsername(newUsername);
        log.debug("Account updated successfully: {}", account.getUsername());

        return profileService.getFullInfoByAccountId(accountId);
    }

}
