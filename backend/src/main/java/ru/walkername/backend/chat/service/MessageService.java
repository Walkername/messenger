package ru.walkername.backend.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.chat.dto.MessageResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.Message;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.mapper.MessageMapper;
import ru.walkername.backend.chat.repository.ChatRepository;
import ru.walkername.backend.chat.repository.MessageRepository;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;

import java.time.Instant;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;

    private final ChatRepository chatRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final ChatService chatService;
    private final MessageMapper messageMapper;

    @Transactional
    public Message send(Message message, Long chatId, UserPrincipal userPrincipal) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(
                () -> {
                    log.warn("Send message attempt for non-existent chat with id {}", chatId);
                    return new ChatNotFoundException("Chat not found");
                }
        );

        // Check If user has access to chat
        if (!chatService.canAccessChat(chatId, userPrincipal)) {
            log.warn("Access attempt by accountId={} to chatId={}", userPrincipal.accountId(), chatId);
            throw new ChatNotFoundException("Chat not found");
        }

        message.setUserId(userPrincipal.accountId());
        message.setChat(chat);
        message.setSentAt(Instant.now());
        Message savedMessage = messageRepository.save(message);

        MessageResponse messageResponse = messageMapper.toMessageResponse(savedMessage);

        // Send to WebSocket
        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatId,
                messageResponse
        );

        chatRepository.updateLastMessageById(chatId, message.getContent());

        return savedMessage;
    }

    public PageResponse<MessageResponse> findMessagesByChatId(Long chatId, int page, int limit) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(
                () -> {
                    log.warn("Find messages attempt for non-existent chat with id {}", chatId);
                    return new ChatNotFoundException("Chat not found");
                }
        );

        Sort sorting = Sort.by(Sort.Direction.DESC, "sentAt");
        Pageable pageable = PageRequest.of(page, limit, sorting);

        Page<Message> messages = messageRepository.findMessagesByChat(chat, pageable);
        List<MessageResponse> content = messages.stream().map(messageMapper::toMessageResponse).toList();

        return new PageResponse<>(
                content,
                page,
                limit,
                messages.getTotalElements(),
                messages.getTotalPages()
        );
    }

}
