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
import ru.walkername.backend.friendship.dto.FriendshipResponse;
import ru.walkername.backend.friendship.entity.Friendship;
import ru.walkername.backend.friendship.entity.FriendshipStatus;
import ru.walkername.backend.friendship.mapper.FriendshipMapper;
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
    private final FriendshipMapper friendshipMapper;

    public Set<FriendshipResponse> findOnlineFriendsBySubscriberId(Long accountId, Set<Long> onlineAccountIds){
        return friendshipRepository
                .findOnlineFriendsBySubscriberIdAndStatus(
                        accountId,
                        FriendshipStatus.FRIENDSHIP,
                        onlineAccountIds
                )
                .stream()
                .map(friendshipMapper::toFriendshipResponse)
                .collect(Collectors.toSet());
    }

    public PageResponse<FriendshipResponse> findOnlineFriendsBySubscriberId(
            Long subscriberId,
            Set<Long> onlineProfiles,
            int page,
            int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<FriendshipResponse> friendships = friendshipRepository
                .findOnlineFriendsBySubscriberIdAndStatus(
                        subscriberId,
                        onlineProfiles,
                        FriendshipStatus.FRIENDSHIP,
                        pageable
                )
                .map(friendshipMapper::toFriendshipResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    public PageResponse<FriendshipResponse> findFriendsBySubscriberId(Long subscriberId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<FriendshipResponse> friendships = friendshipRepository
                .findBySubscriberIdAndStatus(
                        subscriberId,
                        FriendshipStatus.FRIENDSHIP,
                        pageable
                )
                .map(friendshipMapper::toFriendshipResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    public PageResponse<FriendshipResponse> findSubscriptionsBySubscriberId(Long subscriberId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<FriendshipResponse> friendships = friendshipRepository
                .findBySubscriberIdAndStatus(
                        subscriberId,
                        FriendshipStatus.SUBSCRIPTION,
                        pageable
                )
                .map(friendshipMapper::toFriendshipResponse);

        return new PageResponse<>(
                friendships.getContent(),
                page,
                limit,
                friendships.getTotalElements(),
                friendships.getTotalPages()
        );
    }

    public PageResponse<FriendshipResponse> findSubscriptionsOnTargetId(Long targetId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);

        Page<FriendshipResponse> friendships = friendshipRepository
                .findByTargetIdAndStatus(
                        targetId,
                        FriendshipStatus.SUBSCRIPTION,
                        pageable
                )
                .map(friendshipMapper::toFriendshipResponse);

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
