package ru.walkername.backend.common.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.walkername.backend.auth.dto.AuthTokens;
import ru.walkername.backend.auth.entity.Account;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@RequiredArgsConstructor
@Service
public class TokenService {

    private final SecureRandom secureRandom;
    private static final String HASH_ALGORITHM = "SHA-256";

    @Value("${auth.jwt.access}")
    private String accessTokenSecret;

    @Value("${auth.jwt.refresh}")
    private String refreshTokenSecret;

    public String generateAccessToken(Account account) {
        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        return JWT.create()
                .withSubject("Auth Details")
                .withClaim("id", account.getId())
                .withClaim("username", account.getUsername())
                .withClaim("role", account.getRole().toString())
                .withIssuedAt(Instant.now())
                .withIssuer("auth-module")
                .withExpiresAt(expiresAt)
                .sign(Algorithm.HMAC256(accessTokenSecret));
    }

    public String generateRefreshToken(Account account) {
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.DAYS);

        return JWT.create()
                .withSubject("Auth Details")
                .withClaim("id", account.getId())
                .withClaim("username", account.getUsername())
                .withClaim("role", account.getRole().toString())
                .withIssuedAt(Instant.now())
                .withIssuer("auth-module")
                .withExpiresAt(expiresAt)
                .sign(Algorithm.HMAC256(refreshTokenSecret));
    }

    public AuthTokens generateTokensPair(Account account) {
        String accessToken = generateAccessToken(account);
        String refreshToken = generateRefreshToken(account);
        return new AuthTokens(accessToken, refreshToken);
    }

    public DecodedJWT validateAccessToken(String token) {
        return validateToken(token, accessTokenSecret);
    }

    public DecodedJWT validateRefreshToken(String token) {
        return validateToken(token, refreshTokenSecret);
    }

    private DecodedJWT validateToken(String token, String secret) {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secret))
                .withSubject("Auth Details")
                .withIssuer("auth-module")
                .build();

        return verifier.verify(token);
    }

    public String hashToken(String token) {
        try {
            byte[] salt = new byte[16];
            secureRandom.nextBytes(salt);

            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            digest.update(salt);
            byte[] hash = digest.digest(token.getBytes());

            byte[] saltAndHash = new byte[salt.length + hash.length];
            System.arraycopy(salt, 0, saltAndHash, 0, salt.length);
            System.arraycopy(hash, 0, saltAndHash, salt.length, hash.length);

            return Base64.getEncoder().encodeToString(saltAndHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Hashing algorithm not found", e);
        }
    }

    public boolean verifyToken(String rawToken, String tokenHash) {
        try {
            byte[] saltAndHash = Base64.getDecoder().decode(tokenHash);

            byte[] salt = new byte[16];
            System.arraycopy(saltAndHash, 0, salt, 0, salt.length);

            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            digest.update(salt);
            byte[] hash = digest.digest(rawToken.getBytes());

            for (int i = 0; i < hash.length; i++) {
                if (hash[i] != saltAndHash[i + salt.length]) {
                    return false;
                }
            }

            return true;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Hashing algorithm not found", e);
        }
    }

}
