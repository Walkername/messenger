package ru.walkername.backend.call.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import ru.walkername.backend.call.dto.SignalingMessage;

@RequiredArgsConstructor
@Controller
public class SignallingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/video-call/offer")
    public void handleOffer(@Payload SignalingMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + message.to(),
                message
        );
    }

    @MessageMapping("/video-call/answer")
    public void handleAnswer(@Payload SignalingMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + message.to(),
                message
        );
    }

    @MessageMapping("/video-call/ice-candidate")
    public void handleIceCandidate(@Payload SignalingMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/call/" + message.to(),
                message
        );
    }

}
