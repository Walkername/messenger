package ru.walkername.backend.chat.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private ChatService chatService;

    @Mock
    private MessageMapper messageMapper;

    @InjectMocks
    private MessageService messageService;

    @Test
    @DisplayName("send: should return message entity")
    public void shouldReturnMessageBySend() {
        Long chatId = 1L;
        UserPrincipal userPrinciple = new UserPrincipal(5L, "walkername", "USER");

        Message message = new Message();
        message.setContent("Hello World");

        Chat existingChat = new Chat();
        existingChat.setId(chatId);

        Message savedMessage = new Message();
        savedMessage.setId(1L);
        savedMessage.setChat(existingChat);
        savedMessage.setUserId(userPrinciple.userId());
        savedMessage.setContent(message.getContent());
        Instant now = Instant.now();
        savedMessage.setSentAt(now);

        when(chatRepository.findById(chatId)).thenReturn(Optional.of(existingChat));
        when(chatService.canAccessChat(chatId, userPrinciple)).thenReturn(true);
        when(messageRepository.save(message)).thenReturn(savedMessage);

        Message result = messageService.send(message, chatId, userPrinciple);

        assertEquals(savedMessage.getId(), result.getId());
        assertEquals(savedMessage.getChat(), result.getChat());
        assertEquals(savedMessage.getUserId(), result.getUserId());
        assertEquals(savedMessage.getContent(), result.getContent());
        assertEquals(savedMessage.getSentAt().toString(), result.getSentAt().toString());

        verify(chatRepository).findById(chatId);
        verify(chatService).canAccessChat(chatId, userPrinciple);
        verify(messageRepository).save(message);
    }

    @Test
    @DisplayName("send: should throw exception for chat not found")
    public void shouldThrowExceptionForChatNotFoundBySend() {
        Long chatId = 1L;
        UserPrincipal userPrinciple = new UserPrincipal(5L, "walkername", "USER");

        Message message = new Message();
        message.setContent("Hello World");

        when(chatRepository.findById(chatId)).thenReturn(Optional.empty());

        assertThrows(
                ChatNotFoundException.class,
                () -> messageService.send(message, chatId, userPrinciple)
        );


        verify(chatRepository).findById(chatId);
    }

    @Test
    @DisplayName("send: should throw exception for chat access denied")
    public void shouldThrowExceptionForChatAccessDeniedBySend() {
        Long chatId = 1L;
        UserPrincipal userPrinciple = new UserPrincipal(5L, "walkername", "USER");

        Message message = new Message();
        message.setContent("Hello World");

        Chat existingChat = new Chat();
        existingChat.setId(chatId);

        when(chatRepository.findById(chatId)).thenReturn(Optional.of(existingChat));
        when(chatService.canAccessChat(chatId, userPrinciple)).thenReturn(false);

        assertThrows(
                ChatNotFoundException.class,
                () -> messageService.send(message, chatId, userPrinciple)
        );

        verify(chatRepository).findById(chatId);
        verify(chatService).canAccessChat(chatId, userPrinciple);
    }

    @Test
    @DisplayName("findMessagesByChatId: should return list of messages")
    public void shouldReturnMessagesByFindMessagesByChatId() {
        Long chatId = 1L;
        int page = 0;
        int limit = 10;

        Message message1 = new Message();
        message1.setId(1L);
        Message message2 = new Message();
        message2.setId(2L);
        Message message3 = new Message();
        message3.setId(3L);

        Chat existingChat = new Chat();
        existingChat.setId(chatId);
        existingChat.setMessages(List.of(message1, message2, message3));

        Page<Message> messages = new PageImpl<>(List.of(message1, message2, message3));
        MessageResponse response1 = new MessageResponse(1L, chatId, 1L, "", Instant.now());
        MessageResponse response2 = new MessageResponse(2L, chatId, 1L, "", Instant.now());
        MessageResponse response3 = new MessageResponse(3L, chatId, 1L, "", Instant.now());

        when(chatRepository.findById(chatId)).thenReturn(Optional.of(existingChat));
        when(messageRepository.findMessagesByChat(eq(existingChat), any(Pageable.class))).thenReturn(messages);
        when(messageMapper.toMessageResponse(message1)).thenReturn(response1);
        when(messageMapper.toMessageResponse(message2)).thenReturn(response2);
        when(messageMapper.toMessageResponse(message3)).thenReturn(response3);

        PageResponse<MessageResponse> result = messageService.findMessagesByChatId(chatId, page, limit);

        assertEquals(3, result.content().size());
        assertEquals(response1.id(), result.content().getFirst().id());
        assertEquals(response2.id(), result.content().get(1).id());
        assertEquals(response3.id(), result.content().get(2).id());

        verify(chatRepository).findById(chatId);
    }

    @Test
    @DisplayName("findMessagesByChatId: should throw exception for chat not found")
    public void shouldThrowExceptionForChatNotFoundByFindMessagesByChatId() {
        Long chatId = 1L;
        int page = 0;
        int limit = 10;

        when(chatRepository.findById(chatId)).thenReturn(Optional.empty());

        assertThrows(
                ChatNotFoundException.class,
                () -> messageService.findMessagesByChatId(chatId, page, limit)
        );

        verify(chatRepository).findById(chatId);
    }

}
