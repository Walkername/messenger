package ru.walkername.backend.call.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import ru.walkername.backend.call.controller.SignallingController;
import ru.walkername.backend.profile.controller.ProfileStatusController;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final ProfileStatusController controller;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        System.out.println(accessor.getUser().getName());
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        Long accountId = (Long) headerAccessor.getSessionAttributes().get("accountId");
        String sessionId = headerAccessor.getSessionId();

        if (accountId != null && sessionId != null) {
            controller.handleDisconnect(accountId, sessionId);
        }
    }

}
