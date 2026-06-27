package ru.walkername.backend.call.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.walkername.backend.call.dto.SignalingMessage;

@RequiredArgsConstructor
@Controller
public class SignallingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/register")
    @SendTo("/topic/active")
    public String registerUser(@Payload String accountId, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("accountId", accountId);
        System.out.println("Account was registered: " + accountId);
        return accountId + " connected";
    }

    @MessageMapping("/video-call/offer")
    @SendTo("/topic/call")
    public SignalingMessage handleOffer(@Payload SignalingMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + message.to(),
                message
        );
        System.out.println("Offered: " + message.to());
        return message;
    }

    @MessageMapping("/video-call/answer")
    @SendTo("/topic/call")
    public SignalingMessage handleAnswer(@Payload SignalingMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + message.to(),
                message
        );
        System.out.println("Answered: " + message.to());
        return message;
    }

    @MessageMapping("/video-call/ice-candidate")
    @SendTo("/topic/call")
    public SignalingMessage handleIceCandidate(@Payload SignalingMessage message) {
        System.out.println("Ice Candidate: " + message.to());
        messagingTemplate.convertAndSend(
                "/topic/call/" + message.to(),
                message
        );
        System.out.println("Ice Candidate: " + message.to());
        return message;
    }

}
