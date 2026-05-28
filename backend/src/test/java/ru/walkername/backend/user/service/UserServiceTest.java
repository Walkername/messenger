package ru.walkername.backend.user.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.user.entity.User;
import ru.walkername.backend.user.exception.UserExistsException;
import ru.walkername.backend.user.exception.UserNotFoundException;
import ru.walkername.backend.user.repository.UserRepository;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    public void shouldReturnUserBySave() {
        Account account = new Account();
        account.setId(1L);

        User user = new User();
        user.setId(1L);
        user.setAccount(account);

        when(userRepository.existsByAccount(account)).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.save(user);

        assertEquals(1L, result.getId());
        assertEquals(1L, result.getAccount().getId());

        verify(userRepository).existsByAccount(account);
        verify(userRepository).save(user);
    }

    @Test
    public void shouldThrowExceptionWhenUserExistsBySave() {
        Account account = new Account();
        account.setId(1L);

        User user = new User();
        user.setId(1L);
        user.setAccount(account);

        when(userRepository.existsByAccount(account)).thenReturn(true);

        assertThrows(
                UserExistsException.class,
                () -> userService.save(user)
        );

        verify(userRepository).existsByAccount(account);
    }

    @Test
    public void shouldThrowExceptionWhenUserNotFoundByFindOne() {
        Long id = 1L;

        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> userService.findOne(id)
        );

        verify(userRepository).findById(id);
    }

    @Test
    public void shouldReturnUserByUpdateFirstName() {
        Long id = 1L;
        String newFirstName = "Michael";

        User user = new User();
        user.setId(id);
        user.setFirstName(newFirstName);
        Instant now = Instant.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        User result = userService.updateFirstName(id, newFirstName);

        assertEquals(user.getId(), result.getId());
        assertEquals(user.getFirstName(), result.getFirstName());
        assertEquals(user.getCreatedAt().toString(), result.getCreatedAt().toString());
        assertEquals(user.getUpdatedAt().toString(), result.getUpdatedAt().toString());

        verify(userRepository).findById(id);
    }

    @Test
    public void shouldThrowExceptionWhenUserNotFoundByUpdateFirstName() {
        Long id = 1L;
        String newFirstName = "Michael";

        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> userService.updateFirstName(id, newFirstName)
        );

        verify(userRepository).findById(id);
    }

}
