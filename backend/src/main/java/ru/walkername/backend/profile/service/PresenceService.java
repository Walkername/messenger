package ru.walkername.backend.profile.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import ru.walkername.backend.profile.events.PresenceEvent;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
@Service
public class PresenceService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, Set<Long>> observers = new ConcurrentHashMap<>();
    private final Map<Long, Set<String>> sessions = new ConcurrentHashMap<>();

    public Map<Long, Set<String>> getSessions() {
        return Map.copyOf(sessions);
    }

    public boolean isUserOnline(Long accountId) {
        return sessions.containsKey(accountId);
    }

    public Map<Long, Boolean> areUsersOnline(Set<Long> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, Boolean> result = new HashMap<>(accountIds.size());
        for (Long id : accountIds) {
            result.put(id, sessions.containsKey(id));
        }
        return result;
    }

    public void subscribe(
            Long observerId,
            Set<Long> accountIds
    ) {
        System.out.println("Observer#" + observerId + " is watching: " + accountIds);
        for (Long accountId : accountIds) {
            observers
                    .computeIfAbsent(accountId, _ -> ConcurrentHashMap.newKeySet())
                    .add(observerId);
        }
    }

    public void unsubscribe(
            Long observerId,
            Set<Long> accountIds
    ) {
        for (Long accountId : accountIds) {
            Set<Long> set = observers.get(accountId);

            if (set == null) {
                continue;
            }

            set.remove(observerId);

            if (set.isEmpty()) {
                observers.remove(accountId);
            }
        }
    }

    public void userOnline(Long accountId, String sessionId) {
        System.out.println("userOnline#" + accountId + ". His subscribers: " + observers.get(accountId));
        Set<String> userSessions = sessions.computeIfAbsent(
                accountId,
                _ -> ConcurrentHashMap.newKeySet()
        );
        userSessions.add(sessionId);
        System.out.println("His sessions: " + userSessions);

        sendPresenceEvent(accountId, true);
    }

    public void userOffline(Long accountId, String sessionId) {
        System.out.println("userOffline#" + accountId + " His subscribers: " + observers.get(accountId));
        Set<String> userSessions = sessions.get(accountId);
        if (userSessions == null) {
            return;
        }

        userSessions.remove(sessionId);

        if (userSessions.isEmpty()) {
            System.out.println("All sessions has been closed");
            sessions.remove(accountId);

            sendPresenceEvent(accountId, false);
        }
    }

    private void sendPresenceEvent(
            Long accountId,
            boolean online
    ) {
        System.out.println("sendPresenceEvent#" + accountId + " online: " + online);
        PresenceEvent event =
                new PresenceEvent(accountId, online);

        Set<Long> subscribers = observers.get(accountId);

        if (subscribers == null) {
            return;
        }

        for (Long observer : subscribers) {
            messagingTemplate.convertAndSendToUser(
                    observer.toString(),
                    "/queue/presence",
                    event
            );
        }
    }
}
