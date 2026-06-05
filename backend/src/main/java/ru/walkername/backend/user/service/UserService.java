package ru.walkername.backend.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.user.entity.User;
import ru.walkername.backend.user.exception.UserExistsException;
import ru.walkername.backend.user.exception.UserNotFoundException;
import ru.walkername.backend.user.repository.UserRepository;

import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User save(User user) {
        if (userRepository.existsByAccount(user.getAccount())) {
            throw new UserExistsException("User with such account id already exists");
        }
        return userRepository.save(user);
    }

    public User findOne(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with such id not found"));
    }

    public User findByAccountId(Long accountId) {
        return userRepository.findByAccountId(accountId)
                .orElseThrow(() -> new UserNotFoundException("User with such account id not found"));
    }

    @Transactional
    public User updateFirstName(Long id, String newFirstName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Update first name attempt for non-existent user with id={}", id);
                    return new UserNotFoundException("User with such id not found");
                });

        user.setFirstName(newFirstName);
        user.setUpdatedAt(Instant.now());

        log.debug("User's first name with id {} has been updated", id);

        return user;
    }

}
