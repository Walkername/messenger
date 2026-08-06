package ru.walkername.backend.profile.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ru.walkername.backend.profile.service.PresenceService;

import java.util.Objects;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {

    private final PresenceService presenceService;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Long accountId = Long.valueOf(Objects.requireNonNull(accessor.getUser()).getName());
        String sessionId = accessor.getSessionId();

        presenceService.userOnline(accountId, sessionId);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        Long accountId = Long.valueOf(Objects.requireNonNull(headerAccessor.getUser()).getName());
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) {
            throw new NullPointerException("SessionId is null");
        }

        presenceService.userOffline(accountId, sessionId);
    }

}
