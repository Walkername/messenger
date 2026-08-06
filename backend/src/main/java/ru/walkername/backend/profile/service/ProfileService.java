package ru.walkername.backend.profile.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.profile.dto.ProfileResponse;
import ru.walkername.backend.profile.entity.Profile;
import ru.walkername.backend.profile.exception.ProfileExistsException;
import ru.walkername.backend.profile.exception.ProfileNotFoundException;
import ru.walkername.backend.profile.mapper.ProfileMapper;
import ru.walkername.backend.profile.repository.ProfileRepository;
import ru.walkername.backend.profile.view.ProfileView;

import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final PresenceService presenceService;
    private final ProfileMapper profileMapper;

    @Transactional
    public Profile save(Profile profile) {
        if (profileRepository.existsByAccount(profile.getAccount())) {
            throw new ProfileExistsException("User with such account id already exists");
        }
        return profileRepository.save(profile);
    }

    public ProfileResponse findOne(Long accountId) {
        ProfileView view = getFullInfoByAccountId(accountId);
        boolean online = presenceService.isUserOnline(view.accountId());
        return profileMapper.toProfileResponse(view, online);
    }

    public ProfileView getFullInfoByAccountId(Long accountId) {
        return profileRepository.findFullInfoByAccountId(accountId)
                .orElseThrow(() -> new ProfileNotFoundException("User with such account id not found"));
    }

    @Transactional
    public ProfileView updateFirstName(Long accountId, String newFirstName) {
        Profile profile = profileRepository.findByAccountId(accountId)
                .orElseThrow(() -> {
                    log.warn("Update first name attempt for non-existent user (with account id={})", accountId);
                    return new ProfileNotFoundException("User with such id not found");
                });

        profile.setFirstName(newFirstName);
        profile.setUpdatedAt(Instant.now());

        log.debug("User's first name (with account id={}) has been updated", accountId);

        return getFullInfoByAccountId(accountId);
    }

}
