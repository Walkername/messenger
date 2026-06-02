package ru.walkername.backend.common.security;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import ru.walkername.backend.chat.service.ChatService;
import ru.walkername.backend.common.exception.InvalidJWTException;
import ru.walkername.backend.common.exception.WebSocketAccessDeniedException;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Component
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private final TokenService tokenService;
    private final ChatService chatService;

    @Override
    public @Nullable Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            throw new WebSocketAccessDeniedException("Access denied");
        }
        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            handleConnect(accessor);
        }

        if (StompCommand.SUBSCRIBE.equals(command)) {
            handleSubscribe(accessor);
        }

        return message;
    }

    private void handleConnect(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");

        if (authHeaders == null || authHeaders.isEmpty()) {
            throw new InvalidJWTException("Authorization header is required");
        }

        String authHeader = authHeaders.getFirst();
        if (!authHeader.startsWith("Bearer ")) {
            throw new InvalidJWTException("Authorization header is required");
        }

        String token = authHeader.substring(7);
        authenticateToken(token, accessor);
    }

    private void handleSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();

        if (destination == null) return;

        if (destination.startsWith("/topic/chat/")) {
            Long chatId = extractChatId(destination);

            Authentication authentication = (Authentication) accessor.getUser();
            if (authentication == null) {
                throw new WebSocketAccessDeniedException("User not authenticated");
            }

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

            if (!chatService.canAccessChat(chatId, principal)) {
                throw new WebSocketAccessDeniedException("User not authenticated");
            }
        }
    }

    private Long extractChatId(String destination) {
        String[] parts = destination.split("/");
        return Long.parseLong(parts[parts.length - 1]);
    }

    private void authenticateToken(String token, StompHeaderAccessor accessor) {
        try {
            DecodedJWT jwt = tokenService.validateAccessToken(token);
            String role = jwt.getClaim("role").asString();
            String username = jwt.getClaim("username").asString();
            Long userId = jwt.getClaim("id").asLong();

            UserPrincipal userPrincipal = new UserPrincipal(userId, username, role);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userPrincipal,
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority(role))
            );

            SecurityContextHolder.getContext().setAuthentication(auth);

            accessor.setUser(auth);
        } catch (JWTVerificationException e) {
            throw new InvalidJWTException("Invalid JWT token");
        }
    }
}
