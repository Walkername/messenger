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
import ru.walkername.backend.chat.dto.ChatRequest;
import ru.walkername.backend.chat.dto.ChatResponse;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.ChatType;
import ru.walkername.backend.chat.exception.ChatNotFoundException;
import ru.walkername.backend.chat.mapper.ChatMapper;
import ru.walkername.backend.chat.service.ChatService;
import ru.walkername.backend.common.controller.BaseControllerTest;
import ru.walkername.backend.common.security.JWTFilter;
import ru.walkername.backend.common.security.UserPrincipal;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ChatController.class,
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = JWTFilter.class
                )
        })
public class ChatControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatService chatService;

    @MockitoBean
    private ChatMapper chatMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private final UserPrincipal userPrincipal = new UserPrincipal(5L, "walkername", "USER");

    @BeforeEach
    void setup() {
        setUser(userPrincipal);
    }

    @Test
    @DisplayName("Get 200: should return chat response")
    public void shouldReturnChatResponseByGet() throws Exception {
        Long chatId = 1L;

        Chat chat = new Chat();
        chat.setId(chatId);
        chat.setName("Chat123");
        chat.setType(ChatType.PRIVATE);
        Instant now = Instant.now();
        chat.setCreatedAt(now);

        ChatResponse response = new ChatResponse(
                chat.getId(),
                chat.getName(),
                chat.getType(),
                chat.getCreatedAt()
        );

        when(chatService.findOne(chatId, userPrincipal.accountId())).thenReturn(chat);
        when(chatMapper.toChatResponse(chat)).thenReturn(response);

        mockMvc.perform(get("/chats/{chatId}", chatId))
                .andExpect(status().isOk())
                .andExpectAll(
                        jsonPath("$.id").value(response.id()),
                        jsonPath("$.name").value(response.name()),
                        jsonPath("$.type").value(response.type().toString()),
                        jsonPath("$.createdAt").value(response.createdAt().toString())
                );
    }

    @Test
    @DisplayName("Get 200: should return error response for chat not found")
    public void shouldReturnErrorResponseForChatNotFoundByGet() throws Exception {
        Long chatId = 1L;

        when(chatService.findOne(chatId, userPrincipal.accountId())).thenThrow(
                new ChatNotFoundException("Chat not found")
        );

        mockMvc.perform(
                        get("/chats/{chatId}", chatId)
                )
                .andExpect(status().isNotFound())
                .andExpectAll(
                        jsonPath("$.message").value("Chat not found"),
                        jsonPath("$.timestamp").exists()
                );
    }

    @Test
    @DisplayName("Create 201: should return chat response")
    public void shouldReturnChatResponseByCreate() throws Exception {
        Long chatId = 1L;
        ChatRequest request = new ChatRequest("Chat123", ChatType.PRIVATE);

        Chat newChat = new Chat();
        newChat.setName(request.name());
        newChat.setType(request.type());

        Chat savedChat = new Chat();
        savedChat.setId(chatId);
        savedChat.setName(request.name());
        savedChat.setType(request.type());
        Instant now = Instant.now();
        savedChat.setCreatedAt(now);

        ChatResponse response = new ChatResponse(
                savedChat.getId(),
                savedChat.getName(),
                savedChat.getType(),
                savedChat.getCreatedAt()
        );

        when(chatMapper.toChat(request)).thenReturn(newChat);
        when(chatService.save(newChat, userPrincipal.accountId())).thenReturn(savedChat);
        when(chatMapper.toChatResponse(savedChat)).thenReturn(response);

        mockMvc.perform(post("/chats")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpectAll(
                        jsonPath("$.id").value(response.id()),
                        jsonPath("$.name").value(response.name()),
                        jsonPath("$.type").value(response.type().toString()),
                        jsonPath("$.createdAt").value(response.createdAt().toString())
                );

        verify(chatMapper).toChat(request);
        verify(chatService).save(newChat, userPrincipal.accountId());
        verify(chatMapper).toChatResponse(savedChat);
    }

}
