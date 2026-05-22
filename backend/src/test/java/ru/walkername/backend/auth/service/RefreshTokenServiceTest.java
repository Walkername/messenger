package ru.walkername.backend.auth.service;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.dto.RefreshTokenRequest;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.entity.RefreshToken;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.exception.InvalidRefreshTokenException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.auth.repository.RefreshTokenRepository;
import ru.walkername.backend.common.security.TokenService;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private AuthRepository authRepository;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Test
    public void shouldUpdateWhenTokenExists() {
        RefreshToken existingRefreshToken = new RefreshToken(1L, "refreshTokenHash");

        RefreshTokenRequest request = new RefreshTokenRequest("newRefreshToken");

        when(refreshTokenRepository.findByAccountId(1L)).thenReturn(Optional.of(existingRefreshToken));
        when(tokenService.hashToken(request.token())).thenReturn("newRefreshTokenHash");

        refreshTokenService.update(1L, request.token());

        assertEquals("newRefreshTokenHash", existingRefreshToken.getTokenHash());

        verify(refreshTokenRepository).findByAccountId(1L);
        verify(tokenService).hashToken(request.token());
    }

    @Test
    public void shouldCreateWhenTokenNotExists() {
        RefreshTokenRequest request = new RefreshTokenRequest("newRefreshToken");

        when(refreshTokenRepository.findByAccountId(1L)).thenReturn(Optional.empty());
        when(tokenService.hashToken(request.token())).thenReturn("newRefreshTokenHash");

        ArgumentCaptor<RefreshToken> refreshTokenCaptor = ArgumentCaptor.forClass(RefreshToken.class);

        refreshTokenService.update(1L, request.token());

        verify(refreshTokenRepository).save(refreshTokenCaptor.capture());

        RefreshToken savedToken = refreshTokenCaptor.getValue();
        assertEquals(1L, savedToken.getAccountId());
        assertEquals("newRefreshTokenHash", savedToken.getTokenHash());

        verify(tokenService).hashToken(request.token());
        verify(refreshTokenRepository).findByAccountId(1L);
    }

    @Test
    public void shouldReturnJWTResponseByRefreshTokens() {
        RefreshTokenRequest request = new RefreshTokenRequest("correctRefreshToken");
        String correctRefreshTokenHash = "correctRefreshTokenHash";
        RefreshToken existingRefreshToken = new RefreshToken(1L, correctRefreshTokenHash);

        Account existingAccount = new Account();
        existingAccount.setId(1L);

        JWTResponse jwtResponse = new JWTResponse("newAccessToken", "newRefreshToken");

        DecodedJWT mockDecodedJWT = mock(DecodedJWT.class);
        Claim mockClaim = mock(Claim.class);
        when(mockDecodedJWT.getClaim("id")).thenReturn(mockClaim);
        when(mockDecodedJWT.getClaim("id").asLong()).thenReturn(1L);
        when(tokenService.validateRefreshToken(request.token())).thenReturn(mockDecodedJWT);
        when(refreshTokenRepository.findByAccountId(1L)).thenReturn(Optional.of(existingRefreshToken));
        when(tokenService.verifyToken(request.token(), correctRefreshTokenHash)).thenReturn(true);
        when(authRepository.findById(1L)).thenReturn(Optional.of(existingAccount));
        when(tokenService.generateTokensPair(existingAccount)).thenReturn(jwtResponse);

        JWTResponse result = refreshTokenService.refreshTokens(request.token());

        verify(tokenService).validateRefreshToken(request.token());
        verify(refreshTokenRepository, times(2)).findByAccountId(1L);
        verify(tokenService).verifyToken(request.token(), correctRefreshTokenHash);
        verify(authRepository).findById(1L);
        verify(tokenService).generateTokensPair(existingAccount);

        assertEquals(jwtResponse.accessToken(), result.accessToken());
        assertEquals(jwtResponse.refreshToken(), result.refreshToken());
    }

    @Test
    public void shouldThrowExceptionWhenTokenValidationFailsByRefreshTokens() {
        RefreshTokenRequest request = new RefreshTokenRequest("correctRefreshToken");

        when(tokenService.validateRefreshToken(request.token())).thenThrow(JWTVerificationException.class);

        InvalidRefreshTokenException exception = assertThrows(
                InvalidRefreshTokenException.class,
                () -> refreshTokenService.refreshTokens(request.token())
        );

        assertEquals("Invalid refresh token", exception.getMessage());

        verify(tokenService).validateRefreshToken(request.token());
        verify(refreshTokenRepository, never()).findByAccountId(anyLong());
        verify(tokenService, never()).verifyToken(anyString(), anyString());
        verify(authRepository, never()).findById(anyLong());
        verify(tokenService, never()).generateTokensPair(any());
        verify(tokenService, never()).hashToken(anyString());
    }

    @Test
    public void shouldThrowExceptionWhenTokenNotExistsByRefreshTokens() {
        RefreshTokenRequest request = new RefreshTokenRequest("correctRefreshToken");

        DecodedJWT mockDecodedJWT = mock(DecodedJWT.class);
        Claim mockClaim = mock(Claim.class);
        when(mockDecodedJWT.getClaim("id")).thenReturn(mockClaim);
        when(mockDecodedJWT.getClaim("id").asLong()).thenReturn(1L);
        when(tokenService.validateRefreshToken(request.token())).thenReturn(mockDecodedJWT);
        when(refreshTokenRepository.findByAccountId(1L)).thenReturn(Optional.empty());

        InvalidRefreshTokenException exception = assertThrows(
                InvalidRefreshTokenException.class,
                () -> refreshTokenService.refreshTokens(request.token())
        );

        assertEquals("Invalid refresh token", exception.getMessage());

        verify(tokenService).validateRefreshToken(request.token());
        verify(refreshTokenRepository).findByAccountId(1L);
        verify(tokenService, never()).verifyToken(anyString(), anyString());
        verify(authRepository, never()).findById(anyLong());
        verify(tokenService, never()).generateTokensPair(any());
        verify(tokenService, never()).hashToken(anyString());
    }

    @Test
    public void shouldThrowExceptionWhenTokenVerifyingFailsByRefreshTokens() {
        RefreshTokenRequest request = new RefreshTokenRequest("correctRefreshToken");
        String correctRefreshTokenHash = "correctRefreshTokenHash";
        RefreshToken existingRefreshToken = new RefreshToken(1L, correctRefreshTokenHash);

        DecodedJWT mockDecodedJWT = mock(DecodedJWT.class);
        Claim mockClaim = mock(Claim.class);
        when(mockDecodedJWT.getClaim("id")).thenReturn(mockClaim);
        when(mockDecodedJWT.getClaim("id").asLong()).thenReturn(1L);
        when(tokenService.validateRefreshToken(request.token())).thenReturn(mockDecodedJWT);
        when(refreshTokenRepository.findByAccountId(1L)).thenReturn(Optional.of(existingRefreshToken));
        when(tokenService.verifyToken(request.token(), existingRefreshToken.getTokenHash())).thenReturn(false);

        InvalidRefreshTokenException exception = assertThrows(
                InvalidRefreshTokenException.class,
                () -> refreshTokenService.refreshTokens(request.token())
        );

        assertEquals("Invalid refresh token", exception.getMessage());

        verify(tokenService).validateRefreshToken(request.token());
        verify(refreshTokenRepository).findByAccountId(1L);
        verify(tokenService).verifyToken(request.token(), existingRefreshToken.getTokenHash());
        verify(authRepository, never()).findById(anyLong());
        verify(tokenService, never()).generateTokensPair(any());
        verify(tokenService, never()).hashToken(anyString());
    }

    @Test
    public void shouldThrowExceptionWhenAccountNotFoundByRefreshTokens() {
        RefreshTokenRequest request = new RefreshTokenRequest("correctRefreshToken");
        String correctRefreshTokenHash = "correctRefreshTokenHash";
        RefreshToken existingRefreshToken = new RefreshToken(1L, correctRefreshTokenHash);

        DecodedJWT mockDecodedJWT = mock(DecodedJWT.class);
        Claim mockClaim = mock(Claim.class);
        when(mockDecodedJWT.getClaim("id")).thenReturn(mockClaim);
        when(mockDecodedJWT.getClaim("id").asLong()).thenReturn(1L);
        when(tokenService.validateRefreshToken(request.token())).thenReturn(mockDecodedJWT);
        when(refreshTokenRepository.findByAccountId(1L)).thenReturn(Optional.of(existingRefreshToken));
        when(tokenService.verifyToken(request.token(), existingRefreshToken.getTokenHash())).thenReturn(true);
        when(authRepository.findById(1L)).thenReturn(Optional.empty());

        AccountNotFoundException exception = assertThrows(
                AccountNotFoundException.class,
                () -> refreshTokenService.refreshTokens(request.token())
        );

        assertEquals("Account not found", exception.getMessage());

        verify(tokenService).validateRefreshToken(request.token());
        verify(refreshTokenRepository).findByAccountId(1L);
        verify(tokenService).verifyToken(request.token(), existingRefreshToken.getTokenHash());
        verify(authRepository).findById(1L);
        verify(tokenService, never()).generateTokensPair(any());
        verify(tokenService, never()).hashToken(anyString());
    }

}
