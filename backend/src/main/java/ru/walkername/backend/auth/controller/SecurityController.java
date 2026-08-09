package ru.walkername.backend.auth.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.auth.dto.PasswordUpdateRequest;
import ru.walkername.backend.auth.service.AuthService;
import ru.walkername.backend.common.security.UserPrincipal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/security")
public class SecurityController {

    private final AuthService authService;

    @PatchMapping("/password")
    public ResponseEntity<HttpStatus> updatePassword(
            @RequestBody @Valid PasswordUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        authService.updatePassword(userPrincipal.accountId(), request.oldPassword(), request.newPassword());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
