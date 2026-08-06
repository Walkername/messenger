package ru.walkername.backend.profile.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import ru.walkername.backend.profile.service.PresenceService;

import java.security.Principal;
import java.util.Set;

@RequiredArgsConstructor
@Controller
public class PresenceController {

    private final PresenceService presenceService;

    @MessageMapping("/presence/subscribe")
    public void subscribe(
            @Payload Set<Long> accountIds,
            Principal principal
    ) {
        presenceService.subscribe(
                Long.valueOf(principal.getName()),
                accountIds
        );
    }

    @MessageMapping("/presence/unsubscribe")
    public void unsubscribe(
            @Payload Set<Long> accountIds,
            Principal principal
    ) {
        presenceService.unsubscribe(
                Long.valueOf(principal.getName()),
                accountIds
        );
    }

}
