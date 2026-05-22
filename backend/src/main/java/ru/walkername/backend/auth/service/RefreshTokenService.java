package ru.walkername.backend.auth.service;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.entity.RefreshToken;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.exception.InvalidRefreshTokenException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.auth.repository.RefreshTokenRepository;
import ru.walkername.backend.common.security.TokenService;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;
    private final AuthRepository authRepository;

    @Transactional
    public void update(Long accountId, String rawRefreshToken) {
        Optional<RefreshToken> dbRefreshToken = refreshTokenRepository.findByAccountId(accountId);
        String refreshTokenHash = tokenService.hashToken(rawRefreshToken);

        if (dbRefreshToken.isPresent()) {
            RefreshToken existingRefreshToken = dbRefreshToken.get();
            existingRefreshToken.setTokenHash(refreshTokenHash);
        } else {
            RefreshToken newRefreshToken = new RefreshToken(accountId, refreshTokenHash);
            refreshTokenRepository.save(newRefreshToken);
        }
    }

    @Transactional
    public JWTResponse refreshTokens(String refreshToken) {
        Long accountId = validateRefreshToken(refreshToken);

        Account account = getAccountById(accountId);

        JWTResponse jwtResponse = tokenService.generateTokensPair(account);

        update(accountId, jwtResponse.refreshToken());

        return jwtResponse;
    }

    private Account getAccountById(Long accountId) {
        return authRepository.findById(accountId).orElseThrow(
                () -> new AccountNotFoundException("Account not found")
        );
    }

    private Long validateRefreshToken(String rawRefreshToken) {
        try {
            DecodedJWT jwt = tokenService.validateRefreshToken(rawRefreshToken);
            Long userId = jwt.getClaim("id").asLong();

            Optional<RefreshToken> refreshToken = refreshTokenRepository.findByAccountId(userId);
            if (refreshToken.isEmpty()) {
                log.warn("Not such refresh token by userId: {}",  userId);
                throw new InvalidRefreshTokenException("Invalid refresh token");
            }

            RefreshToken existingRefreshToken = refreshToken.get();
            String existingRefreshTokenHash = existingRefreshToken.getTokenHash();
            if (!tokenService.verifyToken(rawRefreshToken, existingRefreshTokenHash)) {
                log.warn("Mismatch between the refresh token from the database and the request by userId: {}",  userId);
                throw new InvalidRefreshTokenException("Invalid refresh token");
            }

            return userId;
        } catch (JWTVerificationException e) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }
    }

}
