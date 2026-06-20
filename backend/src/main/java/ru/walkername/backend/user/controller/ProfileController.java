package ru.walkername.backend.user.controller;

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
import ru.walkername.backend.common.security.UserPrincipal;
import ru.walkername.backend.user.dto.ProfileResponse;
import ru.walkername.backend.user.dto.UpdateFirstNameRequest;
import ru.walkername.backend.user.entity.Profile;
import ru.walkername.backend.user.mapper.ProfileMapper;
import ru.walkername.backend.user.service.ProfileService;

@RequiredArgsConstructor
@RestController
@RequestMapping("/users")
public class ProfileController {

    private final ProfileService profileService;
    private final ProfileMapper profileMapper;

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
        Profile profile = profileService.findByAccountId(userPrincipal.accountId());
        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    @PatchMapping("/me/firstname")
    public ResponseEntity<ProfileResponse> updateMyFirstName(
            @RequestBody UpdateFirstNameRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        String newFirstName = request.firstName();
        Profile profile = profileService.updateFirstName(userPrincipal.accountId(), newFirstName);
        ProfileResponse profileResponse = profileMapper.toProfileResponse(profile);
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

}
