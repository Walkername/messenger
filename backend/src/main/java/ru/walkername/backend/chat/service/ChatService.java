package ru.walkername.backend.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.ChatParticipant;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.repository.ChatParticipantRepository;
import ru.walkername.backend.chat.repository.ChatRepository;
import ru.walkername.backend.common.security.UserPrincipal;

import java.time.Instant;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;

    public Chat findOne(Long chatId, Long userId) {
        return chatRepository.findOneByChatIdAndUserId(chatId, userId).orElseThrow(
                () -> new ChatNotFoundException("Chat not found")
        );
    }

    @Transactional
    public Chat save(Chat chat, Long ownerId) {
        chat.setCreatedAt(Instant.now());
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

        return chatParticipantRepository.existsByChatIdAndUserId(chatId, userPrincipal.userId());
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
