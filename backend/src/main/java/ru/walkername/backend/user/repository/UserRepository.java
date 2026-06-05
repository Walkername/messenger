package ru.walkername.backend.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.user.entity.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByAccountId(Long accountId);

    boolean existsByAccount(Account account);
}
