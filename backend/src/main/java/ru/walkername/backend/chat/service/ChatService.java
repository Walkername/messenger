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
import ru.walkername.backend.chat.dto.ChatParticipantResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.ChatParticipant;
import ru.walkername.backend.chat.entity.ChatType;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.exception.ChatParticipantAlreadyExistsException;
import ru.walkername.backend.chat.exception.ChatParticipantNotFoundException;
import ru.walkername.backend.chat.exception.PrivateChatAlreadyExistsException;
import ru.walkername.backend.chat.exception.PrivateChatTooFewParticipantsException;
import ru.walkername.backend.chat.exception.PrivateChatTooManyParticipantsException;
import ru.walkername.backend.chat.mapper.ChatMapper;
import ru.walkername.backend.chat.mapper.ChatParticipantMapper;
import ru.walkername.backend.chat.repository.ChatParticipantRepository;
import ru.walkername.backend.chat.repository.ChatRepository;
import ru.walkername.backend.chat.view.ChatParticipantView;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;
import ru.walkername.backend.profile.service.PresenceService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMapper chatMapper;
    private final AuthRepository authRepository;
    private final ChatParticipantMapper chatParticipantMapper;
    private final PresenceService presenceService;
    private final ChatAccessService chatAccessService;

    public ChatResponse findOne(Long chatId, Long accountId) {
        Chat chat = chatRepository.findOneByChatIdAndAccountId(chatId, accountId).orElseThrow(
                () -> new ChatNotFoundException("Chat not found")
        );

        long participantsNumber = chatParticipantRepository.countByChatId(chatId);

        if (chat.getType().equals(ChatType.PRIVATE)) {
            return createPrivateChatResponse(chat, accountId, participantsNumber);
        }

        return chatMapper.toChatResponse(chat, participantsNumber);
    }

    private ChatResponse createPrivateChatResponse(Chat chat, Long accountId, long participantsNumber) {
        ChatParticipantView interlocutor = chatParticipantRepository
                .findInterlocutorNameByChatId(chat.getId(), accountId).orElseThrow(
                        () -> new ChatParticipantNotFoundException("Chat participant not found")
                );
        String firstName = interlocutor.firstName();
        String interlocutorName = "";
        if (firstName != null) {
            interlocutorName = firstName;
        }
        interlocutorName += ":" + interlocutor.username();

        return new ChatResponse(
                chat.getId(),
                interlocutorName,
                accountId,
                ChatType.PRIVATE,
                interlocutor.accountId(),
                participantsNumber,
                chat.getCreatedAt(),
                chat.getLastMessage(),
                chat.getLastMessageAt()
        );
    }


    public ChatResponse getByInterlocutorId(Long firstId, Long secondId) {
        Chat chat = chatRepository.findByFirstIdAndSecondIdInPrivateChat(firstId, secondId).orElseThrow(
                () -> new ChatNotFoundException("Chat not found")
        );

        return chatMapper.toChatResponse(chat, 2);
    }

    public PageResponse<ChatResponse> getChatsByAccountId(Long accountId, int page, int limit) {
        Sort sorting = Sort.by(Sort.Direction.DESC, "lastMessageAt");
        Pageable pageable = PageRequest.of(page, limit, sorting);

        Page<Chat> chats = chatRepository.findByAccountId(accountId, pageable);

        List<ChatResponse> content = new ArrayList<>();
        for (Chat chat : chats) {
            if (chat.getType().equals(ChatType.PRIVATE)) {
                ChatResponse response = createPrivateChatResponse(chat, accountId, 2);
                content.add(response);
            } else {
                content.add(chatMapper.toChatResponse(chat));
            }
        }

        return new PageResponse<>(
                content,
                page,
                limit,
                chats.getTotalElements(),
                chats.getTotalPages()
        );
    }

    public PageResponse<ChatParticipantResponse> getChatParticipants(Long chatId, UserPrincipal userPrincipal, int page, int limit) {
        if (!chatAccessService.canAccessChat(chatId, userPrincipal)) {
            log.warn(
                    "Getting chat participants attempt when user (accountID: {}) does not have access to chat with id {}",
                    userPrincipal.accountId(), chatId
            );
            throw new ChatNotFoundException("Chat not found");
        }

        Sort sorting = Sort.by(Sort.Direction.DESC, "joinedAt");
        Pageable pageable = PageRequest.of(page, limit, sorting);

        Page<ChatParticipantView> views = chatParticipantRepository.findByChatId(chatId, pageable);

        Set<Long> accountIds = views.stream()
                .map(ChatParticipantView::accountId)
                .collect(Collectors.toSet());
        Map<Long, Boolean> onlineStatuses = presenceService.areUsersOnline(accountIds);

        List<ChatParticipantResponse> responses = views.getContent().stream()
                .map(view -> {
                    boolean online = onlineStatuses.getOrDefault(view.accountId(), false);
                    return chatParticipantMapper.toChatParticipantResponse(view, online);
                })
                .toList();

        return new PageResponse<>(
                responses,
                page,
                limit,
                views.getTotalElements(),
                views.getTotalPages()
        );
    }

    @Transactional
    public Chat save(Chat chat, Long ownerId, List<Long> participantsIds) {
        if (chat.getType().equals(ChatType.PRIVATE)) {
            validatePrivateChatConditions(ownerId, participantsIds);
        }

        chat.setCreatedAt(Instant.now());
        chat.setLastMessageAt(Instant.now());
        chat.setOwnerAccountId(ownerId);
        Chat savedChat = chatRepository.save(chat);

        createChatParticipant(savedChat.getId(), ownerId);

        for (Long participantId : participantsIds) {
            if (participantId.equals(ownerId)) {
                continue;
            }
            createChatParticipant(savedChat.getId(), participantId);
        }

        return savedChat;
    }

    private void validatePrivateChatConditions(Long ownerId, List<Long> participantsIds) {
        if (participantsIds.size() > 1) {
            throw new PrivateChatTooManyParticipantsException("Only one participant can be saved for a private chat (besides the owner)");
        }
        if (participantsIds.isEmpty()) {
            throw new PrivateChatTooFewParticipantsException("One participant is required for a private chat (besides the owner)");
        }

        Optional<Chat> existingChat = chatRepository
                .findByFirstIdAndSecondIdInPrivateChat(
                        ownerId,
                        participantsIds.getFirst()
                );
        if (existingChat.isPresent()) {
            throw new PrivateChatAlreadyExistsException("Private chat with these participants already exists");
        }
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

        if (!chatAccessService.canAccessChat(chatId, inviterPrincipal)) {
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

    @Transactional
    public void exitChat(Long chatId, Long accountId) {
        chatRepository.findById(chatId).orElseThrow(
                () -> new ChatNotFoundException("Chat not found")
        );
        chatParticipantRepository.deleteByChatIdAndAccountId(chatId, accountId);
    }

}
