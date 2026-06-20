package ru.walkername.backend.chat.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.repository.AuthRepository;
import ru.walkername.backend.chat.dto.ChatResponse;
import ru.walkername.backend.chat.dto.ParticipantResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.ChatParticipant;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.exception.ChatParticipantAlreadyExistsException;
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
    private final AuthRepository authRepository;

    public ChatResponse findOne(Long chatId, Long accountId) {
        Chat chat = chatRepository.findOneByChatIdAndAccountId(chatId, accountId).orElseThrow(
                () -> new ChatNotFoundException("Chat not found")
        );

        long participantsNumber = chatParticipantRepository.countByChatId(chatId);

        return chatMapper.toChatResponse(chat, participantsNumber);
    }

    public PageResponse<ChatResponse> getChatsByAccountId(Long accountId, int page, int limit) {
        Sort sorting = Sort.by(Sort.Direction.DESC, "lastMessageAt");
        Pageable pageable = PageRequest.of(page, limit, sorting);

        Page<Chat> chats = chatRepository.findByAccountId(accountId, pageable);

        List<ChatResponse> content = chats.getContent().stream().map(chatMapper::toChatResponse).toList();

        return new PageResponse<>(
                content,
                page,
                limit,
                chats.getTotalElements(),
                chats.getTotalPages()
        );
    }

    public PageResponse<ParticipantResponse> getChatParticipants(Long chatId, UserPrincipal userPrincipal, int page, int limit) {
        if (!canAccessChat(chatId, userPrincipal)) {
            log.warn(
                    "Getting chat participants attempt when user (accountID: {}) does not have access to chat with id {}",
                    userPrincipal.accountId(), chatId
            );
            throw new ChatNotFoundException("Chat not found");
        }

        Sort sorting = Sort.by(Sort.Direction.DESC, "joinedAt");
        Pageable pageable = PageRequest.of(page, limit, sorting);

        Page<ParticipantResponse> participants = chatParticipantRepository.findByChatId(chatId, pageable);

        return new PageResponse<>(
                participants.getContent(),
                page,
                limit,
                participants.getTotalElements(),
                participants.getTotalPages()
        );
    }

    @Transactional
    public Chat save(Chat chat, Long ownerId) {
        chat.setCreatedAt(Instant.now());
        chat.setLastMessageAt(Instant.now());
        chat.setOwnerAccountId(ownerId);
        Chat savedChat = chatRepository.save(chat);

        createChatParticipant(savedChat.getId(), ownerId);

        return savedChat;
    }

    private void createChatParticipant(Long chatId, Long accountId) {
        if (chatParticipantRepository.existsByChatIdAndAccountId(chatId, accountId)) {
            throw new ChatParticipantAlreadyExistsException("This user is already a member of the chat");
        }

        ChatParticipant chatParticipant = new ChatParticipant();
        chatParticipant.setAccountId(accountId);
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

        return chatParticipantRepository.existsByChatIdAndAccountId(chatId, userPrincipal.accountId());
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

    @Transactional
    public void inviteByUsername(Long chatId, UserPrincipal inviterPrincipal, String invitedUsername) {
        if (!chatRepository.existsById(chatId)) {
            log.warn("Invite user attempt for non-existent chat with id {}", chatId);
            throw new ChatNotFoundException("Chat not found");
        }

        if (!canAccessChat(chatId, inviterPrincipal)) {
            log.warn("Invite user attempt when user (accountID: {}) does not have access to chat with id {}", inviterPrincipal.accountId(), chatId);
            throw new ChatNotFoundException("Chat not found");
        }

        Account invitedAccount = authRepository.findByUsername(invitedUsername).orElseThrow(
                () -> {
                    log.warn("Invite user attempt for non-existent invited user with name {}", invitedUsername);
                    return new AccountNotFoundException("Invited user not found");
                }
        );

        createChatParticipant(chatId, invitedAccount.getId());
    }

}
