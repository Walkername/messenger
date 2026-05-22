package ru.walkername.backend.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.user.entity.User;
import ru.walkername.backend.user.exception.UserExistsException;
import ru.walkername.backend.user.exception.UserNotFoundException;
import ru.walkername.backend.user.repository.UserRepository;

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
                .orElseThrow(() -> {
                    return new UserNotFoundException("User with such id not found");
                });
    }

}
