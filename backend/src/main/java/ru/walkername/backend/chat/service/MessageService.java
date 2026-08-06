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

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;

    private final ChatRepository chatRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final ChatAccessService chatAccessService;
    private final MessageMapper messageMapper;

    @Transactional
    public MessageResponse send(Message message, Long chatId, UserPrincipal userPrincipal) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(
                () -> {
                    log.warn("Send message attempt for non-existent chat with id {}", chatId);
                    return new ChatNotFoundException("Chat not found");
                }
        );

        // Check If user has access to chat
        if (!chatAccessService.canAccessChat(chatId, userPrincipal)) {
            log.warn("Access attempt by accountId={} to chatId={}", userPrincipal.accountId(), chatId);
            throw new ChatNotFoundException("Chat not found");
        }

        message.setAccountId(userPrincipal.accountId());
        message.setChat(chat);
        Instant now = Instant.now();
        message.setSentAt(now);
        Message savedMessage = messageRepository.save(message);

        MessageResponse messageResponse = new MessageResponse(
                savedMessage.getId(),
                chat.getId(),
                userPrincipal.accountId(),
                userPrincipal.username(),
                message.getContent(),
                message.getSentAt()
        );

        // Send to WebSocket
        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatId,
                messageResponse
        );

        chatRepository.updateLastMessageById(chatId, message.getContent(), now);

        return messageResponse;
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

        Page<MessageResponse> messages = messageRepository.findMessagesByChat(chat, pageable).map(messageMapper::toMessageResponse);

        return new PageResponse<>(
                messages.getContent(),
                page,
                limit,
                messages.getTotalElements(),
                messages.getTotalPages()
        );
    }

}
