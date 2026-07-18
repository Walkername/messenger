package ru.walkername.backend.friendship.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;
import ru.walkername.backend.friendship.dto.FriendResponse;
import ru.walkername.backend.friendship.dto.IncomingRequestResponse;
import ru.walkername.backend.friendship.dto.OnlineFriendNotificationResponse;
import ru.walkername.backend.friendship.dto.OutgoingRequestResponse;
import ru.walkername.backend.friendship.entity.Friendship;
import ru.walkername.backend.friendship.entity.FriendshipStatus;
import ru.walkername.backend.friendship.mapper.FriendMapper;
import ru.walkername.backend.friendship.repository.FriendshipRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final AuthRepository authRepository;
    private final FriendMapper friendMapper;

    public Set<OnlineFriendNotificationResponse> findOnlineFriendsByAccountIdForNotification(Long accountId, Set<Long> onlineAccountIds){
        return friendshipRepository
                .findOnlineFriendsForNotification(
                        accountId,
                        onlineAccountIds
                )
                .stream()
                .map(friendMapper::toOnlineFriendNotificationResponse)
                .collect(Collectors.toSet());
    }

    public PageResponse<FriendResponse> findOnlineFriendsByAccountId(
            Long accountId,
            Set<Long> onlineAccountIds,
            int page,
            int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<FriendResponse> friendships = friendshipRepository
                .findOnlineFriendsByAccountId(
                        accountId,
                        onlineAccountIds,
                        pageable
                )
                .map(friendMapper::toFriendResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    public PageResponse<FriendResponse> findFriendsByAccountId(Long accountId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<FriendResponse> friendships = friendshipRepository
                .findFriendsByAccountId(
                        accountId,
                        pageable
                )
                .map(friendMapper::toFriendResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    public PageResponse<OutgoingRequestResponse> findSubscriptionsByAccountId(Long accountId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<OutgoingRequestResponse> friendships = friendshipRepository
                .findSubscriptionsByAccountId(
                        accountId,
                        pageable
                )
                .map(friendMapper::toOutgoingRequestResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    public PageResponse<IncomingRequestResponse> findSubscribersByAccountId(Long accountId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<IncomingRequestResponse> friendships = friendshipRepository
                .findSubscribersByAccountId(
                        accountId,
                        pageable
                )
                .map(friendMapper::toIncomingRequestResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    @Transactional
    public Friendship inviteAsFriend(UserPrincipal principal, Long targetId) {
        FriendshipStatus status = FriendshipStatus.SUBSCRIPTION;
        Optional<Friendship> friendshipFromTarget = friendshipRepository
                .findBySubscriberIdAndTargetId(targetId, principal.accountId());
        if (friendshipFromTarget.isPresent()) {
            status = FriendshipStatus.FRIENDSHIP;
            Friendship friendshipByTargetGet = friendshipFromTarget.get();
            friendshipByTargetGet.setStatus(status);
            friendshipByTargetGet.setUpdatedAt(Instant.now());
        }

        Friendship newFriendship = new Friendship(
                principal.accountId(),
                targetId,
                status,
                Instant.now(),
                Instant.now()
        );

        return friendshipRepository.save(newFriendship);
    }

    @Transactional
    public Friendship inviteAsFriend(UserPrincipal principal, String username) {
        FriendshipStatus status = FriendshipStatus.SUBSCRIPTION;

        Account account = authRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Account with name {} not found", username);
                    return new AccountNotFoundException("Account with name " + username + " not found");
                });
        Optional<Friendship> friendshipFromTarget = friendshipRepository
                .findBySubscriberIdAndTargetId(account.getId(), principal.accountId());
        if (friendshipFromTarget.isPresent()) {
            status = FriendshipStatus.FRIENDSHIP;
            Friendship friendshipByTargetGet = friendshipFromTarget.get();
            friendshipByTargetGet.setStatus(status);
            friendshipByTargetGet.setUpdatedAt(Instant.now());
        }

        Friendship newFriendship = new Friendship(
                principal.accountId(),
                account.getId(),
                status,
                Instant.now(),
                Instant.now()
        );

        return friendshipRepository.save(newFriendship);
    }

    @Transactional
    public void removeFromFriends(UserPrincipal principal, Long targetId) {
        Optional<Friendship> friendshipByTarget = friendshipRepository.findBySubscriberIdAndTargetId(targetId, principal.accountId());
        if (friendshipByTarget.isPresent()) {
            Friendship friendshipByTargetGet = friendshipByTarget.get();
            friendshipByTargetGet.setStatus(FriendshipStatus.SUBSCRIPTION);
            friendshipByTargetGet.setUpdatedAt(Instant.now());
        }

        friendshipRepository.deleteBySubscriberIdAndTargetId(principal.accountId(), targetId);
        log.info("Friendship by subscriber ({}) with target ({}) was deleted", principal.accountId(), targetId);
    }

}
