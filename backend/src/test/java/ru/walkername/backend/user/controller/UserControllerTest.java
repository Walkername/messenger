package ru.walkername.backend.user.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import ru.walkername.backend.common.security.JWTFilter;
import ru.walkername.backend.user.dto.UpdateFirstNameRequest;
import ru.walkername.backend.user.dto.UserResponse;
import ru.walkername.backend.user.entity.User;
import ru.walkername.backend.user.exception.UserNotFoundException;
import ru.walkername.backend.user.mapper.UserMapper;
import ru.walkername.backend.user.service.UserService;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = UserController.class,
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = JWTFilter.class
                )
        })
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserMapper userMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Get 200: should return user response")
    public void shouldReturnUserResponseByGet() throws Exception {
        Long id = 1L;

        User user = new User();
        user.setId(id);
        user.setFirstName("Michael");
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        UserResponse response = new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        when(userService.findOne(id)).thenReturn(user);
        when(userMapper.toUserResponse(user)).thenReturn(response);

        mockMvc.perform(get("/users/{id}", id))
                .andExpect(status().isOk())
                .andExpectAll(
                        jsonPath("$.id").value(id),
                        jsonPath("$.firstName").value(response.firstName()),
                        jsonPath("$.createdAt").value(response.createdAt().toString()),
                        jsonPath("$.updatedAt").value(response.updatedAt().toString())
                );
    }

    @Test
    @DisplayName("Get 404: should return error response for non-existent user")
    public void shouldReturnErrorResponseForUserNotFoundByGet() throws Exception {
        Long id = 1L;

        User user = new User();
        user.setId(id);

        when(userService.findOne(id)).thenThrow(new UserNotFoundException("User with such id not found"));

        mockMvc.perform(get("/users/{id}", 1))
                .andExpect(status().isNotFound())
                .andExpectAll(
                        jsonPath("$.message")
                                .value("User with such id not found"),
                        jsonPath("$.timestamp").exists()
                );
    }

    @Test
    @DisplayName("Update FirstName 200: should return updated user response")
    public void shouldReturnUserResponseByUpdateFirstName() throws Exception {
        Long id = 1L;
        String newFirstName = "Johny";
        UpdateFirstNameRequest request = new UpdateFirstNameRequest(newFirstName);

        User user = new User();
        user.setId(id);
        user.setFirstName(newFirstName);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        UserResponse response = new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        when(userService.updateFirstName(id, newFirstName)).thenReturn(user);
        when(userMapper.toUserResponse(user)).thenReturn(response);

        mockMvc.perform(
                        patch("/users/{id}/firstname", id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpectAll(
                        jsonPath("$.id").value(id),
                        jsonPath("$.firstName").value(response.firstName()),
                        jsonPath("$.createdAt").value(response.createdAt().toString()),
                        jsonPath("$.updatedAt").value(response.updatedAt().toString())
                );
    }

    @Test
    @DisplayName("Update Username 404: should return error response for non-existent user")
    public void shouldReturnErrorResponseForUserNotFoundByUpdateFirstName() throws Exception {
        Long id = 1L;
        String newFirstName = "Johny";
        UpdateFirstNameRequest request = new UpdateFirstNameRequest(newFirstName);

        User user = new User();
        user.setId(id);
        user.setFirstName(newFirstName);

        when(userService.updateFirstName(id, newFirstName)).thenThrow(
                new UserNotFoundException("User with such id not found")
        );

        mockMvc.perform(
                        patch("/users/{id}/firstname", id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isNotFound())
                .andExpectAll(
                        jsonPath("$.message")
                                .value("User with such id not found"),
                        jsonPath("$.timestamp").exists()
                );
    }

}
