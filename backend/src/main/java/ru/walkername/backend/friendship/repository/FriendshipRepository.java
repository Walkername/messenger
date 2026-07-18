package ru.walkername.backend.friendship.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.friendship.entity.Friendship;
import ru.walkername.backend.friendship.view.FriendView;
import ru.walkername.backend.friendship.view.IncomingRequestView;
import ru.walkername.backend.friendship.view.OnlineFriendNotificationView;
import ru.walkername.backend.friendship.view.OutgoingRequestView;

import java.util.Optional;
import java.util.Set;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    Optional<Friendship> findBySubscriberIdAndTargetId(Long subscriberId, Long targetId);

    void deleteBySubscriberIdAndTargetId(Long subscriberId, Long targetId);

    @Query("""
            SELECT new ru.walkername.backend.friendship.view.FriendView(
                f.id,
                f.targetId,
                a.username,
                p.firstName,
                f.createdAt,
                f.updatedAt
            )
            FROM Friendship f
            JOIN Account a ON a.id = f.targetId
            JOIN Profile p ON p.account.id = a.id
            WHERE f.subscriberId = :accountId
            AND f.status = ru.walkername.backend.friendship.entity.FriendshipStatus.FRIENDSHIP
            ORDER BY a.username ASC
""")
    Page<FriendView> findFriendsByAccountId(Long accountId, Pageable pageable);

    @Query("""
            SELECT new ru.walkername.backend.friendship.view.OutgoingRequestView(
                f.id,
                f.targetId,
                a.username,
                p.firstName,
                f.createdAt,
                f.updatedAt
            )
            FROM Friendship f
            JOIN Account a ON a.id = f.targetId
            JOIN Profile p ON p.account.id = a.id
            WHERE f.subscriberId = :accountId
            AND f.status = ru.walkername.backend.friendship.entity.FriendshipStatus.SUBSCRIPTION
            ORDER BY a.username ASC
""")
    Page<OutgoingRequestView> findSubscriptionsByAccountId(Long accountId, Pageable pageable);

    @Query("""
            SELECT new ru.walkername.backend.friendship.view.IncomingRequestView(
                f.id,
                f.subscriberId,
                a.username,
                p.firstName,
                f.createdAt,
                f.updatedAt
            )
            FROM Friendship f
            JOIN Account a ON a.id = f.subscriberId
            JOIN Profile p ON p.account.id = a.id
            WHERE f.targetId = :accountId
            AND f.status = ru.walkername.backend.friendship.entity.FriendshipStatus.SUBSCRIPTION
            ORDER BY a.username ASC
""")
    Page<IncomingRequestView> findSubscribersByAccountId(Long accountId, Pageable pageable);

    @Query("""
            SELECT new ru.walkername.backend.friendship.view.FriendView(
                f.id,
                f.targetId,
                a.username,
                p.firstName,
                f.createdAt,
                f.updatedAt
            )
            FROM Friendship f
            JOIN Account a ON a.id = f.targetId
            JOIN Profile p ON p.account.id = a.id
            WHERE f.subscriberId = :accountId
            AND f.status = ru.walkername.backend.friendship.entity.FriendshipStatus.FRIENDSHIP
            AND f.targetId IN :onlineAccountIds
            ORDER BY a.username ASC
""")
    Page<FriendView> findOnlineFriendsByAccountId(
            Long accountId,
            Set<Long> onlineAccountIds,
            Pageable pageable
    );

    /**
     * Finds all the user's online friends for sending notifications
     * @param accountId - the account that is currently online
     * @param onlineAccountIds - the set of IDs who are currently online
     * @return a set of notifications for each online friend
     */
    @Query("""
            SELECT new ru.walkername.backend.friendship.view.OnlineFriendNotificationView(
                f.targetId,
                new ru.walkername.backend.friendship.view.FriendView(
                    f.id,
                    f.subscriberId,
                    a.username,
                    p.firstName,
                    f.createdAt,
                    f.updatedAt
                )
            )
            FROM Friendship f
            JOIN Account a ON a.id = f.subscriberId
            JOIN Profile p ON p.account.id = a.id
            WHERE f.subscriberId = :accountId
            AND f.status = ru.walkername.backend.friendship.entity.FriendshipStatus.FRIENDSHIP
            AND f.targetId IN :onlineAccountIds
            ORDER BY a.username ASC
""")
    Set<OnlineFriendNotificationView> findOnlineFriendsForNotification(
            Long accountId,
            Set<Long> onlineAccountIds
    );

}
