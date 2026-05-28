package ru.walkername.backend.auth.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import ru.walkername.backend.auth.dto.AccountResponse;
import ru.walkername.backend.auth.dto.AuthRequest;
import ru.walkername.backend.auth.dto.JWTResponse;
import ru.walkername.backend.auth.dto.RefreshTokenRequest;
import ru.walkername.backend.auth.entity.Account;
import ru.walkername.backend.auth.entity.AccountRole;
import ru.walkername.backend.auth.exception.AccountExistsException;
import ru.walkername.backend.auth.exception.AccountNotFoundException;
import ru.walkername.backend.auth.exception.InvalidCredentialsException;
import ru.walkername.backend.auth.exception.InvalidRefreshTokenException;
import ru.walkername.backend.auth.mapper.AccountMapper;
import ru.walkername.backend.auth.service.AuthService;
import ru.walkername.backend.auth.service.RefreshTokenService;
import ru.walkername.backend.common.security.JWTFilter;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;

import static org.hamcrest.CoreMatchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = {
                @ComponentScan.Filter(
                        type = FilterType.ASSIGNABLE_TYPE,
                        classes = JWTFilter.class
                )
        })
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private AccountMapper accountMapper;

    @MockitoBean
    private RefreshTokenService refreshTokenService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Register 201: Should return account response")
    public void shouldReturnAccountByRegister() throws Exception {
        AuthRequest request = new AuthRequest("user123", "password123");

        Account account = new Account();
        account.setId(1L);
        account.setUsername("user123");

        AccountResponse response = new AccountResponse(
                account.getId(),
                account.getUsername()
        );

        when(authService.register(request)).thenReturn(account);
        when(accountMapper.toAccountResponse(account)).thenReturn(response);

        mockMvc.perform(
                        post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isCreated())
                .andExpectAll(
                        jsonPath("$.id").value(account.getId()),
                        jsonPath("$.username").value(account.getUsername())
                );

    }

    @Test
    @DisplayName("Register 409: Should return error response for username conflict")
    public void shouldReturnErrorForUsernameConflictByRegister() throws Exception {
        AuthRequest request = new AuthRequest("user123", "password123");

        Account account = new Account();
        Instant currentTime = Instant.now();
        account.setId(1L);
        account.setUsername("user123");
        account.setPasswordHash("password123Hash");
        account.setRole(AccountRole.USER);
        account.setCreatedAt(currentTime);
        account.setUpdatedAt(currentTime);

        when(authService.register(request)).thenThrow(new AccountExistsException(
                "Account with such username already exists"
        ));

        mockMvc.perform(
                        post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isConflict())
                .andExpectAll(
                        jsonPath("$.message").value("Account with such username already exists")
                );
    }

    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("invalidAuthRequests")
    @DisplayName("Register 400: Should return error response for invalid registration data")
    public void shouldReturnErrorForInvalidDataByRegister(
            String testCase,
            AuthRequest request,
            String expectedField,
            List<String> expectedMessages
    ) throws Exception {
        mockMvc.perform(
                        post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation error"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpectAll(
                        expectedMessages.stream()
                                .map(part -> jsonPath("$.fieldErrors." + expectedField, containsString(part)))
                                .toArray(ResultMatcher[]::new)
                );
    }

    private static Stream<Arguments> invalidAuthRequests() {
        return Stream.of(
                Arguments.of(
                        "Empty username",
                        new AuthRequest("", "password123"),
                        "username",
                        List.of(
                                "Username should not be null, empty or blank",
                                "Username should be greater than 4 and less than 31 characters"
                        )
                ),
                Arguments.of(
                        "Blank username",
                        new AuthRequest("  ", "password123"),
                        "username",
                        List.of(
                                "Username should not be null, empty or blank",
                                "Username should be greater than 4 and less than 31 characters"
                        )
                ),
                Arguments.of(
                        "Too short username (3 chars)",
                        new AuthRequest("usr", "password123"),
                        "username",
                        List.of("Username should be greater than 4 and less than 31 characters")
                ),
                Arguments.of(
                        "Too long username (31 chars)",
                        new AuthRequest("a".repeat(31), "password123"),
                        "username",
                        List.of("Username should be greater than 4 and less than 31 characters")
                ),
                Arguments.of(
                        "Empty password",
                        new AuthRequest("user123", ""),
                        "password",
                        List.of(
                                "Password should not be null, empty or blank",
                                "Password should be greater than 5 characters"
                        )
                ),
                Arguments.of(
                        "Blank password",
                        new AuthRequest("user123", "   "),
                        "password",
                        List.of(
                                "Password should not be null, empty or blank",
                                "Password should be greater than 5 characters"
                        )
                ),
                Arguments.of(
                        "Too short password (4 chars)",
                        new AuthRequest("user123", "pass"),
                        "password",
                        List.of("Password should be greater than 5 characters")
                ),
                Arguments.of(
                        "Null username",
                        new AuthRequest(null, "password123"),
                        "username",
                        List.of("Username should not be null, empty or blank")
                ),
                Arguments.of(
                        "Null password",
                        new AuthRequest("user123", null),
                        "password",
                        List.of("Password should not be null, empty or blank")
                )
        );
    }

    @Test
    @DisplayName("Login 200: Should return jwt response")
    public void shouldReturnJwtResponseByLogin() throws Exception {
        AuthRequest request = new AuthRequest("user123", "password123");

        JWTResponse jwtResponse = new JWTResponse("accessToken", "refreshTken");

        when(authService.login(request)).thenReturn(jwtResponse);

        mockMvc.perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(jwtResponse.accessToken()))
                .andExpect(jsonPath("$.refreshToken").value(jwtResponse.refreshToken()));
    }

    @Test
    @DisplayName("Login 400: Should return error response for invalid username")
    public void shouldReturnErrorForInvalidCredentialsByLogin() throws Exception {
        AuthRequest request = new AuthRequest("user123", "password123");

        when(authService.login(request)).thenThrow(new InvalidCredentialsException("Wrong credentials"));

        mockMvc.perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Wrong credentials"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @ParameterizedTest(name = "{index}: {0}")
    @MethodSource("invalidAuthRequests")
    @DisplayName("Login 400: Should return error response for invalid login data")
    public void shouldReturnErrorForInvalidDataByLogin(
            String testCase,
            AuthRequest request,
            String expectedField,
            List<String> expectedMessages
    ) throws Exception {
        mockMvc.perform(
                        post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation error"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpectAll(
                        expectedMessages.stream()
                                .map(part -> jsonPath("$.fieldErrors." + expectedField, containsString(part)))
                                .toArray(ResultMatcher[]::new)
                );
    }

    @Test
    @DisplayName("Refresh 200: Should return jwt response")
    public void shouldReturnJwtResponseByRefresh() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("rawRefreshToken");

        JWTResponse jwtResponse = new JWTResponse("accessToken", "refreshTken");

        when(refreshTokenService.refreshTokens(request.token())).thenReturn(jwtResponse);

        mockMvc.perform(
                        post("/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value(jwtResponse.accessToken()))
                .andExpect(jsonPath("$.refreshToken").value(jwtResponse.refreshToken()));
    }

    @Test
    @DisplayName("Refresh 400: Should return error response for invalid token")
    public void shouldReturnErrorForInvalidTokenByRefresh() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("rawRefreshToken");

        when(refreshTokenService.refreshTokens(request.token()))
                .thenThrow(new InvalidRefreshTokenException("Invalid refresh token"));

        mockMvc.perform(
                        post("/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid refresh token"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("Refresh 404: Should return error response for non-existent account")
    public void shouldReturnErrorForAccountNotFoundByRefresh() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest("rawRefreshToken");

        when(refreshTokenService.refreshTokens(request.token()))
                .thenThrow(new AccountNotFoundException("Account not found"));

        mockMvc.perform(
                        post("/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request))
                )
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Account not found"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

}
