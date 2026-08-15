package ru.walkername.backend.chat.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.walkername.backend.chat.dto.ChatResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.ChatType;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.mapper.ChatMapper;
import ru.walkername.backend.chat.repository.ChatParticipantRepository;
import ru.walkername.backend.chat.repository.ChatRepository;
import ru.walkername.backend.common.security.UserPrincipal;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ChatServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private ChatMapper chatMapper;

    @Mock
    private ChatParticipantRepository chatParticipantRepository;

    @InjectMocks
    private ChatService chatService;

    @Test
    @DisplayName("findOne: should return chat entity")
    public void shouldReturnChatByFindOne() {
        Long chatId = 1L;
        Long accountId = 5L;
        Long ownerId = 10L;
        long participantsNumber = 3;

        Chat chat = new Chat();
        chat.setId(chatId);
        chat.setOwnerAccountId(ownerId);
        chat.setName("Chat123");
        chat.setType(ChatType.PRIVATE);
        Instant now = Instant.now();
        chat.setCreatedAt(now);
        chat.setLastMessage("Hello");
        chat.setLastMessageAt(now);

        ChatResponse response = new ChatResponse(
                chatId,
                chat.getName(),
                ownerId,
                chat.getType(),
                null,
                participantsNumber,
                chat.getCreatedAt(),
                chat.getLastMessage(),
                chat.getLastMessageAt()
        );

        when(chatRepository.findOneByChatIdAndAccountId(chatId, accountId))
                .thenReturn(Optional.of(chat));
        when(chatParticipantRepository.countByChatId(chatId)).thenReturn(participantsNumber);
        when(chatMapper.toChatResponse(chat, participantsNumber)).thenReturn(response);

        ChatResponse result = chatService.findOne(chatId, accountId);

        assertEquals(chatId, result.id());
        assertEquals(ownerId, result.ownerAccountId());
        assertEquals("Chat123", result.name());
        assertEquals(ChatType.PRIVATE, result.type());
        assertEquals(now.toString(), result.createdAt().toString());

        verify(chatRepository).findOneByChatIdAndAccountId(chatId, accountId);
        verify(chatMapper).toChatResponse(chat, participantsNumber);
    }

    @Test
    @DisplayName("findOne: should throw exception for chat not found")
    public void shouldThrowExceptionForChatNotFoundByFindOne() {
        Long chatId = 1L;
        Long accountId = 5L;

        Chat chat = new Chat();
        chat.setId(chatId);

        when(chatRepository.findOneByChatIdAndAccountId(chatId, accountId))
                .thenReturn(Optional.empty());

        assertThrows(
                ChatNotFoundException.class,
                () -> chatService.findOne(chatId, accountId)
        );

        verify(chatRepository).findOneByChatIdAndAccountId(chatId, accountId);
    }

    @Test
    @DisplayName("save: should return chat entity")
    public void shouldReturnChatBySave() {
        Long chatId = 1L;
        Long ownerId = 10L;
        String name = "Chat123";
        ChatType type = ChatType.PRIVATE;

        Chat chat = new Chat();
        chat.setName(name);
        chat.setType(type);

        when(chatRepository.save(chat)).thenReturn(chat);

        Chat result = chatService.save(chat, ownerId, Collections.emptyList());
        chat.setId(chatId);

        assertEquals(chatId, result.getId());
        assertEquals(ownerId, result.getOwnerAccountId());
        assertEquals(name, result.getName());
        assertEquals(type, result.getType());

        verify(chatRepository).save(chat);
    }

//    @Test
//    @DisplayName("canAccessChat: should return false when chat not exists")
//    public void shouldReturnFalseWhenChatNotFoundByCanAccessChat() {
//        Long chatId = 1L;
//        UserPrincipal userPrincipal = new UserPrincipal(5L, "walkername", "USER");
//
//        when(chatRepository.existsById(chatId)).thenReturn(false);
//
//        boolean result = chatService.canAccessChat(chatId, userPrincipal);
//
//        assertFalse(result);
//
//        verify(chatRepository).existsById(chatId);
//    }

//    @Test
//    @DisplayName("canAccessChat: should return true when user can access chat")
//    public void shouldReturnTrueForUserByCanAccessChat() {
//        Long chatId = 1L;
//        UserPrincipal userPrincipal = new UserPrincipal(5L, "walkername", "USER");
//
//        when(chatRepository.existsById(chatId)).thenReturn(true);
//        when(chatParticipantRepository.existsByChatIdAndAccountId(chatId, userPrincipal.accountId()))
//                .thenReturn(true);
//
//        boolean result = chatService.canAccessChat(chatId, userPrincipal);
//
//        assertTrue(result);
//
//        verify(chatRepository).existsById(chatId);
//        verify(chatParticipantRepository).existsByChatIdAndAccountId(chatId, userPrincipal.accountId());
//    }

//    @Test
//    @DisplayName("canAccessChat: should return true for admin")
//    public void shouldReturnTrueForAdminByCanAccessChat() {
//        Long chatId = 1L;
//        UserPrincipal userPrincipal = new UserPrincipal(5L, "walkername", "ADMIN");
//
//        when(chatRepository.existsById(chatId)).thenReturn(true);
//
//        boolean result = chatService.canAccessChat(chatId, userPrincipal);
//
//        assertTrue(result);
//
//        verify(chatRepository).existsById(chatId);
//    }

    @Test
    @DisplayName("update: should return chat entity")
    public void shouldReturnChatByUpdate() {
        Long chatId = 1L;
        Chat existingChat = new Chat();
        existingChat.setName("Chat123");

        Chat updatedChat = new Chat();
        updatedChat.setName("UpdatedChat123");

        when(chatRepository.findById(chatId)).thenReturn(Optional.of(existingChat));

        Chat result = chatService.update(chatId, updatedChat);

        assertEquals(updatedChat.getName(), result.getName());

        verify(chatRepository).findById(chatId);
    }

    @Test
    @DisplayName("update: should throw exception for chat not found")
    public void shouldThrowExceptionForChatNotFoundByUpdate() {
        Long chatId = 1L;

        when(chatRepository.findById(chatId)).thenReturn(Optional.empty());

        assertThrows(
                ChatNotFoundException.class,
                () -> chatService.update(chatId, new Chat())
        );

        verify(chatRepository).findById(chatId);
    }

    @Test
    @DisplayName("delete: should delete when chat exists")
    public void shouldDeleteByDelete() {
        Long chatId = 1L;
        Chat chat = new Chat();
        chat.setId(chatId);

        when(chatRepository.findById(chatId)).thenReturn(Optional.of(chat));
        doNothing().when(chatRepository).delete(chat);

        chatService.delete(chatId);

        verify(chatRepository).findById(chatId);
        verify(chatRepository).delete(chat);
    }

    @Test
    @DisplayName("delete: should throw exception when chat not exists")
    public void shouldThrowExceptionForChatNotFoundByDelete() {
        Long chatId = 1L;
        Chat chat = new Chat();
        chat.setId(chatId);

        when(chatRepository.findById(chatId)).thenReturn(Optional.empty());

        assertThrows(
                ChatNotFoundException.class,
                () -> chatService.delete(chatId)
        );

        verify(chatRepository).findById(chatId);
        verify(chatRepository, never()).delete(any());
    }

}
