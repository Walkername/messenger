package ru.walkername.backend.profile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.profile.entity.Profile;
import ru.walkername.backend.profile.view.ProfileView;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    @Query("""
            SELECT new ru.walkername.backend.profile.view.ProfileView(
                a.id,
                p.id,
                a.username,
                p.firstName,
                p.createdAt,
                p.updatedAt
            )
            FROM Profile p
            JOIN Account a
            ON p.account.id = a.id
            WHERE a.id = :accountId
""")
    Optional<ProfileView> findFullInfoByAccountId(Long accountId);

    @Query("SELECT p FROM Profile p WHERE p.account.id = :accountId")
    Optional<Profile> findByAccountId(Long accountId);

    boolean existsByAccount(Account account);
}
