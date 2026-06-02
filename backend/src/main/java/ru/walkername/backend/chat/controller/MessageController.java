package ru.walkername.backend.chat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.chat.dto.MessageRequest;
import ru.walkername.backend.chat.dto.MessageResponse;
import ru.walkername.backend.chat.entity.Message;
import ru.walkername.backend.chat.mapper.MessageMapper;
import ru.walkername.backend.chat.service.MessageService;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/chats/{chatId}/messages")
public class MessageController {

    private final MessageService messageService;
    private final MessageMapper messageMapper;

    @PostMapping()
    public ResponseEntity<MessageResponse> save(
            @PathVariable Long chatId,
            @RequestBody MessageRequest messageRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Message message = messageMapper.toMessage(messageRequest);
        Message savedMessage = messageService.send(message, chatId, userPrincipal);
        MessageResponse messageResponse = messageMapper.toMessageResponse(savedMessage);
        return new ResponseEntity<>(messageResponse, HttpStatus.CREATED);
    }

    @GetMapping()
    public ResponseEntity<PageResponse<MessageResponse>> getMessagesByChat(
            @PathVariable Long chatId,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "10") Integer limit
    ) {
        PageResponse<MessageResponse> messages = messageService.findMessagesByChatId(chatId, page, limit);
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

}
