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
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> userService.findOne(1L)
        );

        verify(userRepository).findById(1L);
    }

}
