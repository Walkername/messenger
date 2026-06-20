package ru.walkername.backend.user.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.user.entity.Profile;
import ru.walkername.backend.user.exception.ProfileExistsException;
import ru.walkername.backend.user.exception.ProfileNotFoundException;
import ru.walkername.backend.user.repository.ProfileRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private ProfileService profileService;

    @Test
    public void shouldReturnUserBySave() {
        Account account = new Account();
        account.setId(1L);

        Profile profile = new Profile();
        profile.setId(1L);
        profile.setAccount(account);

        when(profileRepository.existsByAccount(account)).thenReturn(false);
        when(profileRepository.save(profile)).thenReturn(profile);

        Profile result = profileService.save(profile);

        assertEquals(1L, result.getId());
        assertEquals(1L, result.getAccount().getId());

        verify(profileRepository).existsByAccount(account);
        verify(profileRepository).save(profile);
    }

    @Test
    public void shouldThrowExceptionWhenUserExistsBySave() {
        Account account = new Account();
        account.setId(1L);

        Profile profile = new Profile();
        profile.setId(1L);
        profile.setAccount(account);

        when(profileRepository.existsByAccount(account)).thenReturn(true);

        assertThrows(
                ProfileExistsException.class,
                () -> profileService.save(profile)
        );

        verify(profileRepository).existsByAccount(account);
    }

    @Test
    public void shouldThrowExceptionWhenUserNotFoundByFindOne() {
        Long id = 1L;

        when(profileRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(
                ProfileNotFoundException.class,
                () -> profileService.findOne(id)
        );

        verify(profileRepository).findById(id);
    }

    @Test
    public void shouldReturnUserByUpdateFirstName() {
        Long id = 1L;
        String newFirstName = "Michael";

        Profile profile = new Profile();
        profile.setId(id);
        profile.setFirstName(newFirstName);
        Instant now = Instant.now();
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);

        when(profileRepository.findById(id)).thenReturn(Optional.of(profile));

        Profile result = profileService.updateFirstName(id, newFirstName);

        assertEquals(profile.getId(), result.getId());
        assertEquals(profile.getFirstName(), result.getFirstName());
        assertEquals(profile.getCreatedAt().toString(), result.getCreatedAt().toString());
        assertEquals(profile.getUpdatedAt().toString(), result.getUpdatedAt().toString());

        verify(profileRepository).findById(id);
    }

    @Test
    public void shouldThrowExceptionWhenUserNotFoundByUpdateFirstName() {
        Long id = 1L;
        String newFirstName = "Michael";

        when(profileRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(
                ProfileNotFoundException.class,
                () -> profileService.updateFirstName(id, newFirstName)
        );

        verify(profileRepository).findById(id);
    }

}
