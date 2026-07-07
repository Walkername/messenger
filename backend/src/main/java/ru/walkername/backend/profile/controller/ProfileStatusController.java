package ru.walkername.backend.profile.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.walkername.backend.friendship.dto.FriendshipResponse;
import ru.walkername.backend.friendship.service.FriendshipService;
import ru.walkername.backend.profile.events.ProfileStatusChangeEvent;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Controller
public class ProfileStatusController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, Set<String>> sessions = new ConcurrentHashMap<>();
    private final FriendshipService friendshipService;

    public Map<Long, Set<String>> getSessions() {
        return Map.copyOf(sessions);
    }

    @MessageMapping("/profile/register")
    public void registerUser(@Payload Long accountId, SimpMessageHeaderAccessor headerAccessor) {
        System.out.println("registerUser");
        String sessionId = headerAccessor.getSessionId();
        headerAccessor.getSessionAttributes().put("accountId", accountId);

        Set<String> userSessions = sessions.computeIfAbsent(
                accountId,
                _ -> ConcurrentHashMap.newKeySet()
        );

        boolean becameOnline = userSessions.isEmpty();

        userSessions.add(sessionId);

        if (becameOnline) {
            notifyFriendsAboutUserOnline(accountId);
        }
    }

    private void notifyFriendsAboutUserOnline(Long accountId) {
        Set<FriendshipResponse> usersOnlineFriends = friendshipService
                .findOnlineFriendsBySubscriberId(accountId, getSessions().keySet());

        if (usersOnlineFriends.isEmpty()) {
            return;
        }

        for (FriendshipResponse friendship : usersOnlineFriends) {
            ProfileStatusChangeEvent event = new ProfileStatusChangeEvent(
                    accountId,
                    friendship,
                    true
            );
            messagingTemplate.convertAndSendToUser(
                    friendship.targetId().toString(),
                    "/queue/friend-status-change",
                    event
            );
        }
    }

    public void handleDisconnect(Long accountId, String sessionId) {
        if (accountId == null || sessionId == null) {
            return;
        }

        Set<String> userSessions = sessions.get(accountId);
        if (userSessions == null) {
            return;
        }

        userSessions.remove(sessionId);

        if (userSessions.isEmpty()) {
            sessions.remove(accountId);

            notifyFriendsAboutUserOffline(accountId);
        }
    }

    private void notifyFriendsAboutUserOffline(Long accountId) {
        Set<FriendshipResponse> usersOnlineFriends = friendshipService
                .findOnlineFriendsBySubscriberId(accountId, getSessions().keySet());

        if (usersOnlineFriends.isEmpty()) {
            return;
        }

        for (FriendshipResponse friendship : usersOnlineFriends) {
            ProfileStatusChangeEvent event = new ProfileStatusChangeEvent(
                    accountId,
                    friendship,
                    false
            );

            messagingTemplate.convertAndSendToUser(
                    friendship.targetId().toString(),
                    "/queue/friend-status-change",
                    event
            );
        }
    }

}
