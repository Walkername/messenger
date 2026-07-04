package ru.walkername.backend.friendship.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.friendship.entity.Friendship;
import ru.walkername.backend.friendship.entity.FriendshipStatus;
import ru.walkername.backend.friendship.view.FriendshipView;

import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findBySubscriberIdAndTargetId(Long subscriberId, Long targetId);

    boolean deleteBySubscriberIdAndTargetId(Long subscriberId, Long targetId);

    @Query("""
            SELECT new ru.walkername.backend.friendship.view.FriendshipView(
                f.id,
                f.subscriberId,
                f.targetId,
                a.username,
                p.firstName,
                f.createdAt,
                f.updatedAt
            )
            FROM Friendship f
            JOIN Account a
            ON a.id = f.targetId
            JOIN Profile p
            ON p.account.id = a.id
            WHERE f.subscriberId = :subscriberId
            AND f.status = :status
            ORDER BY a.username ASC
""")
    Page<FriendshipView> findBySubscriberIdAndStatus(Long subscriberId, FriendshipStatus status, Pageable pageable);

    @Query("""
            SELECT new ru.walkername.backend.friendship.view.FriendshipView(
                f.id,
                f.subscriberId,
                f.targetId,
                a.username,
                p.firstName,
                f.createdAt,
                f.updatedAt
            )
            FROM Friendship f
            JOIN Account a
            ON a.id = f.subscriberId
            JOIN Profile p
            ON p.account.id = a.id
            WHERE f.targetId = :targetId
            AND f.status = :status
            ORDER BY a.username ASC
""")
    Page<FriendshipView> findByTargetIdAndStatus(Long subscriberId, FriendshipStatus status, Pageable pageable);

}
