package ru.walkername.backend.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.auth.entity.Account;

import java.util.Optional;

@Repository
public interface AuthRepository extends JpaRepository<Account, Long> {

    boolean existsByUsername(String username);

    Optional<Account> findByUsername(String username);

}
