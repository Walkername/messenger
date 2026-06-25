package ru.walkername.backend.profile.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.profile.entity.Profile;
import ru.walkername.backend.profile.exception.ProfileExistsException;
import ru.walkername.backend.profile.exception.ProfileNotFoundException;
import ru.walkername.backend.profile.repository.ProfileRepository;
import ru.walkername.backend.profile.view.ProfileView;

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
        Long profileId = 1L;
        Long accountId = 2L;
        String newFirstName = "Michael";

        Profile profile = new Profile();
        profile.setId(profileId);
        profile.setFirstName(newFirstName);
        Instant now = Instant.now();
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);

        ProfileView view = new ProfileView(
                accountId,
                profileId,
                "username123",
                newFirstName,
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );

        when(profileRepository.findByAccountId(accountId)).thenReturn(Optional.of(profile));
        when(profileRepository.findFullInfoByAccountId(accountId)).thenReturn(Optional.of(view));

        ProfileView result = profileService.updateFirstName(accountId, newFirstName);

        assertEquals(profile.getId(), result.profileId());
        assertEquals(profile.getFirstName(), result.firstName());

        verify(profileRepository).findByAccountId(accountId);
        verify(profileRepository).findByAccountId(accountId);
    }

    @Test
    public void shouldThrowExceptionWhenUserNotFoundByUpdateFirstName() {
        Long id = 1L;
        String newFirstName = "Michael";

        when(profileRepository.findByAccountId(id)).thenReturn(Optional.empty());

        assertThrows(
                ProfileNotFoundException.class,
                () -> profileService.updateFirstName(id, newFirstName)
        );

        verify(profileRepository).findByAccountId(id);
    }

}
