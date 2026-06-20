package ru.walkername.backend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.user.entity.Profile;
import ru.walkername.backend.user.exception.ProfileExistsException;
import ru.walkername.backend.user.exception.ProfileNotFoundException;
import ru.walkername.backend.user.repository.ProfileRepository;

import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Transactional
    public Profile save(Profile profile) {
        if (profileRepository.existsByAccount(profile.getAccount())) {
            throw new ProfileExistsException("User with such account id already exists");
        }
        return profileRepository.save(profile);
    }

    public Profile findOne(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() -> new ProfileNotFoundException("User with such id not found"));
    }

    public Profile findByAccountId(Long accountId) {
        return profileRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ProfileNotFoundException("User with such account id not found"));
    }

    @Transactional
    public Profile updateFirstName(Long id, String newFirstName) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Update first name attempt for non-existent user with id={}", id);
                    return new ProfileNotFoundException("User with such id not found");
                });

        profile.setFirstName(newFirstName);
        profile.setUpdatedAt(Instant.now());

        log.debug("User's first name with id {} has been updated", id);

        return profile;
    }

}
