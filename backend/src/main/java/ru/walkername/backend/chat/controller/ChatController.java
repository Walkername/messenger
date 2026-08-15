package ru.walkername.backend.chat.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.chat.dto.ChatRequest;
import ru.walkername.backend.chat.dto.ChatResponse;
import ru.walkername.backend.chat.dto.ChatParticipantResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.mapper.ChatMapper;
import ru.walkername.backend.chat.service.ChatService;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/chats")
public class ChatController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;

    @GetMapping("/me")
    public ResponseEntity<PageResponse<ChatResponse>> getMyChats(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "10") Integer limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PageResponse<ChatResponse> response = chatService.getChatsByAccountId(userPrincipal.accountId(), page, limit);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponse> get(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ChatResponse response = chatService.findOne(chatId, userPrincipal.accountId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/interlocutor/{interlocutorId}")
    public ResponseEntity<ChatResponse> getByInterlocutorId(
            @PathVariable Long interlocutorId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        ChatResponse response = chatService.getByInterlocutorId(interlocutorId, userPrincipal.accountId());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{chatId}/participants")
    public ResponseEntity<PageResponse<ChatParticipantResponse>> getParticipants(
            @PathVariable Long chatId,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "10") Integer limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PageResponse<ChatParticipantResponse> response = chatService.getChatParticipants(chatId, userPrincipal, page, limit);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<ChatResponse> create(
            @RequestBody ChatRequest chatRequest,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Chat chat = chatMapper.toChat(chatRequest);
        Chat savedChat = chatService.save(chat, userPrincipal.accountId(), chatRequest.participantsIds());
        ChatResponse chatResponse = chatMapper.toChatResponse(savedChat);
        return new ResponseEntity<>(chatResponse, HttpStatus.CREATED);
    }

    @PostMapping("/{chatId}/invite")
    public ResponseEntity<HttpStatus> invite(
            @PathVariable Long chatId,
            @RequestParam String username,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        chatService.inviteByUsername(chatId, userPrincipal, username);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{chatId}/exit")
    public ResponseEntity<HttpStatus> exit(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        chatService.exitChat(chatId, userPrincipal.accountId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
