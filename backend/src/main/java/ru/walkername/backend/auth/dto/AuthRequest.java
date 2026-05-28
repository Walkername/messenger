package ru.walkername.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthRequest(
        @NotBlank(message = "Username should not be null, empty or blank")
        @Size(min = 5, max = 30, message = "Username should be greater than 4 and less than 31 characters")
        String username,
        @NotBlank(message = "Password should not be null, empty or blank")
        @Size(min = 5, message = "Password should be greater than 5 characters")
        String password
) {
}
