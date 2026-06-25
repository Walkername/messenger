package ru.walkername.backend.profile.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.auth.service.AuthService;
import ru.walkername.backend.common.security.UserPrincipal;
import ru.walkername.backend.profile.dto.ProfileResponse;
import ru.walkername.backend.profile.dto.UpdateFirstNameRequest;
import ru.walkername.backend.profile.dto.UpdateUsernameRequest;
import ru.walkername.backend.profile.entity.Profile;
import ru.walkername.backend.profile.mapper.ProfileMapper;
import ru.walkername.backend.profile.view.ProfileView;
import ru.walkername.backend.profile.service.ProfileService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private final ProfileMapper profileMapper;
    private final AuthService authService;

    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> get(
            @PathVariable Long id
    ) {
        Profile profile = profileService.findOne(id);
        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMe(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ProfileView view = profileService.getFullInfoByAccountId(userPrincipal.accountId());
        ProfileResponse response = profileMapper.toProfileResponse(view);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/me/firstname")
    public ResponseEntity<ProfileResponse> updateMyFirstName(
            @RequestBody UpdateFirstNameRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        String newFirstName = request.firstName();
        ProfileView view = profileService.updateFirstName(userPrincipal.accountId(), newFirstName);
        ProfileResponse response = profileMapper.toProfileResponse(view);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/me/username")
    public ResponseEntity<ProfileResponse> updateMyUsername(
            @RequestBody UpdateUsernameRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        String newUsername = request.username();
        ProfileView view = authService.updateUsername(userPrincipal.accountId(), newUsername);
        ProfileResponse response = profileMapper.toProfileResponse(view);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
