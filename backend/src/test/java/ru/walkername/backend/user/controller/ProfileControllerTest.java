package ru.walkername.backend.user.controller;

import org.junit.jupiter.api.BeforeEach;
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
import ru.walkername.backend.common.controller.BaseControllerTest;
import ru.walkername.backend.common.security.JWTFilter;
import ru.walkername.backend.common.security.UserPrincipal;
import ru.walkername.backend.user.dto.ProfileResponse;
import ru.walkername.backend.user.dto.UpdateFirstNameRequest;
import ru.walkername.backend.user.entity.Profile;
import ru.walkername.backend.user.exception.ProfileNotFoundException;
import ru.walkername.backend.user.mapper.ProfileMapper;
import ru.walkername.backend.user.service.ProfileService;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ProfileController.class,
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = JWTFilter.class
                )
        })
@AutoConfigureMockMvc(addFilters = false)
public class ProfileControllerTest extends BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProfileService profileService;

    @MockitoBean
    private ProfileMapper profileMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private final UserPrincipal userPrincipal = new UserPrincipal(5L, "walkername", "USER");

    @BeforeEach
    void setup() {
        setUser(userPrincipal);
    }

    @Test
    @DisplayName("Get 200: should return user response")
    public void shouldReturnUserResponseByGet() throws Exception {
        Long id = 1L;

        Profile profile = new Profile();
        profile.setId(id);
        profile.setFirstName("Michael");
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());

        ProfileResponse response = new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );

        when(profileService.findOne(id)).thenReturn(profile);
        when(profileMapper.toProfileResponse(profile)).thenReturn(response);

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

        Profile profile = new Profile();
        profile.setId(id);

        when(profileService.findOne(id)).thenThrow(new ProfileNotFoundException("User with such id not found"));

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

        Profile profile = new Profile();
        profile.setId(id);
        profile.setFirstName(newFirstName);
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());

        ProfileResponse response = new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );

        when(profileService.updateFirstName(userPrincipal.accountId(), newFirstName)).thenReturn(profile);
        when(profileMapper.toProfileResponse(profile)).thenReturn(response);

        mockMvc.perform(
                        patch("/users/me/firstname")
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
    @DisplayName("Update FirstName 404: should return error response for non-existent user")
    public void shouldReturnErrorResponseForUserNotFoundByUpdateFirstName() throws Exception {
        Long id = 1L;
        String newFirstName = "Johny";
        UpdateFirstNameRequest request = new UpdateFirstNameRequest(newFirstName);

        Profile profile = new Profile();
        profile.setId(id);
        profile.setFirstName(newFirstName);

        when(profileService.updateFirstName(userPrincipal.accountId(), newFirstName)).thenThrow(
                new ProfileNotFoundException("User with such id not found")
        );

        mockMvc.perform(
                        patch("/users/me/firstname")
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
