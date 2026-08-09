package ru.walkername.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordUpdateRequest(
        @NotBlank(message = "Password should not be null, empty or blank")
        @Size(min = 5, message = "Password should be greater than 5 characters")
        String oldPassword,
        @NotBlank(message = "Password should not be null, empty or blank")
        @Size(min = 5, message = "Password should be greater than 5 characters")
        String newPassword
) {
}
