package ru.walkername.backend.auth.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.auth.entity.RefreshToken;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByAccountId(Long accountId);

    @Query("SELECT rt FROM RefreshToken rt WHERE rt.accountId = :accountId")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RefreshToken> findByAccountIdWithLock(Long accountId);

}
