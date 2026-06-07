package ru.walkername.backend.chat.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ru.walkername.backend.chat.dto.MessageRequest;
import ru.walkername.backend.chat.dto.MessageResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.Message;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.mapper.MessageMapper;
import ru.walkername.backend.chat.service.MessageService;
import ru.walkername.backend.common.controller.BaseControllerTest;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.JWTFilter;
import ru.walkername.backend.common.security.UserPrincipal;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MessageController.class,
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = JWTFilter.class
                )
        })
public class MessageControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MessageService messageService;

    @MockitoBean
    private MessageMapper messageMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private final UserPrincipal userPrincipal = new UserPrincipal(5L, "walkername", "USER");

    @BeforeEach
    void setup() {
        setUser(userPrincipal);
    }

    @Test
    @DisplayName("save 201: should return message response")
    public void shouldReturnMessageResponseBySave() throws Exception {
        Long chatId = 1L;
        MessageRequest request = new MessageRequest("message123");

        Chat chat = new Chat();
        chat.setId(chatId);

        Message message = new Message();
        message.setContent(request.content());

        Message savedMessage = new Message();
        savedMessage.setId(2L);
        savedMessage.setChat(chat);
        savedMessage.setUserId(userPrincipal.accountId());
        savedMessage.setContent(message.getContent());
        Instant now = Instant.now();
        savedMessage.setSentAt(now);

        MessageResponse response = new MessageResponse(
                savedMessage.getId(),
                savedMessage.getChat().getId(),
                userPrincipal.accountId(),
                savedMessage.getUserId(),
                "John",
                savedMessage.getContent(),
                savedMessage.getSentAt()
        );

        when(messageMapper.toMessage(request)).thenReturn(message);
        when(messageService.send(message, chatId, userPrincipal)).thenReturn(savedMessage);
        when(messageMapper.toMessageResponse(savedMessage)).thenReturn(response);

        mockMvc.perform(
                        post("/chats/{chatId}/messages", chatId)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpectAll(
                        jsonPath("$.id").value(response.id())
                );
    }

    @Test
    @DisplayName("save 404: should throw exception for chat not found")
    public void shouldThrowExceptionForChatNotFoundBySave() throws Exception {
        Long chatId = 1L;
        MessageRequest request = new MessageRequest("message123");

        Chat chat = new Chat();
        chat.setId(chatId);

        Message message = new Message();
        message.setContent(request.content());

        Message savedMessage = new Message();
        savedMessage.setId(2L);
        savedMessage.setChat(chat);
        savedMessage.setUserId(userPrincipal.accountId());
        savedMessage.setContent(message.getContent());
        Instant now = Instant.now();
        savedMessage.setSentAt(now);

        when(messageMapper.toMessage(request)).thenReturn(message);
        when(messageService.send(message, chatId, userPrincipal))
                .thenThrow(new ChatNotFoundException("Chat not found"));

        mockMvc.perform(
                        post("/chats/{chatId}/messages", chatId)
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isNotFound())
                .andExpectAll(
                        jsonPath("$.message").value("Chat not found"),
                        jsonPath("$.timestamp").exists()
                );
    }

    @Test
    @DisplayName("getMessagesByChat 200: should return list of message responses")
    public void shouldReturnMessageResponseByGetMessagesByChat() throws Exception {
        Long chatId = 1L;
        Integer page = 0;
        Integer limit = 10;

        MessageResponse response1 = new MessageResponse(
                1L,
                chatId,
                userPrincipal.accountId(),
                1L,
                "John",
                "First message",
                Instant.parse("2024-01-01T10:00:00Z")
        );

        MessageResponse response2 = new MessageResponse(
                2L,
                chatId,
                userPrincipal.accountId(),
                1L,
                "John",
                "Second message",
                Instant.parse("2024-01-01T10:05:00Z")
        );

        PageResponse<MessageResponse> messages = new PageResponse<>(
                List.of(response1, response2),
                page,
                limit,
                2,
                0
        );

        when(messageService.findMessagesByChatId(chatId, page, limit)).thenReturn(messages);

        mockMvc.perform(get("/chats/{chatId}/messages", chatId)
                        .param("page", String.valueOf(page))
                        .param("limit", String.valueOf(limit))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].content").value("First message"))
                .andExpect(jsonPath("$.content[0].sentAt").value("2024-01-01T10:00:00Z"))
                .andExpect(jsonPath("$.content[1].id").value(2L))
                .andExpect(jsonPath("$.content[1].content").value("Second message"))
                .andExpect(jsonPath("$.content[1].sentAt").value("2024-01-01T10:05:00Z"));

        verify(messageService).findMessagesByChatId(chatId, page, limit);
    }

    @Test
    @DisplayName("getMessagesByChat: should return error response for chat not found")
    public void shouldReturnErrorResponseForChatNotFoundByGetMessagesByChat() throws Exception {
        Long chatId = 1L;
        Integer page = 0;
        Integer limit = 10;

        when(messageService.findMessagesByChatId(chatId, page, limit)).thenThrow(
                new ChatNotFoundException("Chat not found")
        );

        mockMvc.perform(get("/chats/{chatId}/messages", chatId)
                        .param("page", String.valueOf(page))
                        .param("limit", String.valueOf(limit))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpectAll(
                        jsonPath("$.message").value("Chat not found"),
                        jsonPath("$.timestamp").exists()
                );

        verify(messageService).findMessagesByChatId(chatId, page, limit);
    }

}
