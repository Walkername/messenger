package ru.walkername.backend.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.auth.dto.AccountResponse;
import ru.walkername.backend.auth.dto.AuthRequest;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.dto.RefreshTokenRequest;
import ru.walkername.backend.auth.entity.Account;
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
            @RequestBody @Valid AuthRequest authRequest
    ) {
        JWTResponse jwtResponse = authService.login(authRequest);

        return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<JWTResponse> refreshTokens(
            @RequestBody @Valid RefreshTokenRequest refreshTokenRequest
    ) {
        String rawRefreshToken = refreshTokenRequest.token();

        JWTResponse jwtResponse = refreshTokenService.refreshTokens(rawRefreshToken);

        return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
    }

}
