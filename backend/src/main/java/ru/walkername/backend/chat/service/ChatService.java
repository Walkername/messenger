package ru.walkername.backend.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.chat.dto.ChatResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.ChatParticipant;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.mapper.ChatMapper;
import ru.walkername.backend.chat.repository.ChatParticipantRepository;
import ru.walkername.backend.chat.repository.ChatRepository;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;

import java.time.Instant;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMapper chatMapper;

    public Chat findOne(Long chatId, Long userId) {
        return chatRepository.findOneByChatIdAndUserId(chatId, userId).orElseThrow(
                () -> new ChatNotFoundException("Chat not found")
        );
    }

    public PageResponse<ChatResponse> getChatsByUserId(Long userId, int page, int limit) {
        Sort sorting = Sort.by(Sort.Direction.DESC, "lastMessageAt");
        Pageable pageable = PageRequest.of(page, limit, sorting);

        Page<Chat> chats = chatRepository.findByUserId(userId, pageable);

        List<ChatResponse> content = chats.getContent().stream().map(chatMapper::toChatResponse).toList();

        return new PageResponse<>(
                content,
                page,
                limit,
                chats.getTotalElements(),
                chats.getTotalPages()
        );
    }

    @Transactional
    public Chat save(Chat chat, Long ownerId) {
        chat.setCreatedAt(Instant.now());
        chat.setLastMessageAt(Instant.now());
        chat.setOwnerId(ownerId);
        Chat savedChat = chatRepository.save(chat);

        createChatParticipant(savedChat.getId(), ownerId);

        return savedChat;
    }

    private void createChatParticipant(Long chatId, Long userId) {
        ChatParticipant chatParticipant = new ChatParticipant();
        chatParticipant.setUserId(userId);
        chatParticipant.setChatId(chatId);
        chatParticipant.setJoinedAt(Instant.now());
        chatParticipantRepository.save(chatParticipant);
    }

    public boolean canAccessChat(Long chatId, UserPrincipal userPrincipal) {
        if (!chatRepository.existsById(chatId)) {
            return false;
        }

        if (userPrincipal.role().equals("ADMIN")) {
            return true;
        }

        return chatParticipantRepository.existsByChatIdAndUserId(chatId, userPrincipal.accountId());
    }

    @Transactional
    public Chat update(Long id, Chat updatedChat) {
        Chat chat = chatRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Update attempt for non-existent chat with id {}", id);
                    return new ChatNotFoundException("Chat not found");
                }
        );

        chat.setName(updatedChat.getName());

        return chat;
    }

    @Transactional
    public void delete(Long id) {
        Chat chat = chatRepository.findById(id).orElseThrow(
                () -> {
                    log.warn("Delete attempt for non-existent chat with id {}", id);
                    return new ChatNotFoundException("Chat not found");
                }
        );

        chatRepository.delete(chat);
    }

}
