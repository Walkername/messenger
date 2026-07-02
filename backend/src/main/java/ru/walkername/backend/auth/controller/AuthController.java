package ru.walkername.backend.auth.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.auth.dto.AccountResponse;
import ru.walkername.backend.auth.dto.AuthRequest;
import ru.walkername.backend.auth.dto.AuthTokens;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.exception.RefreshTokenCookieNotFoundException;
import ru.walkername.backend.auth.mapper.AccountMapper;
import ru.walkername.backend.auth.service.AuthService;
import ru.walkername.backend.auth.service.RefreshTokenService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final AccountMapper accountMapper;

    @PostMapping("/register")
    public ResponseEntity<AccountResponse> register(
            @RequestBody @Valid AuthRequest authRequest
    ) {
        Account createdAccount = authService.register(authRequest);

        AccountResponse accountResponse = accountMapper.toAccountResponse(createdAccount);

        return new ResponseEntity<>(accountResponse, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JWTResponse> login(
            @RequestBody @Valid AuthRequest authRequest,
            HttpServletResponse response
    ) {
        AuthTokens authTokens = authService.login(authRequest);

        generateCookieWithRefreshToken(authTokens.refreshToken(), response);

        JWTResponse jwtResponse = new JWTResponse(authTokens.accessToken());

        return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JWTResponse> refreshTokens(
            HttpServletRequest request, HttpServletResponse response
    ) {
        String rawRefreshToken = getRefreshTokenFromCookie(request);

        AuthTokens authTokens = refreshTokenService.refreshTokens(rawRefreshToken);

        generateCookieWithRefreshToken(authTokens.refreshToken(),  response);

        JWTResponse jwtResponse = new JWTResponse(authTokens.accessToken());

        return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
    }

    private void generateCookieWithRefreshToken(String token, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(30 * 24 * 60 * 60)
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refresh_token")) {
                    return cookie.getValue();
                }
            }
        }

        throw new RefreshTokenCookieNotFoundException("No refresh token found");
    }

}
