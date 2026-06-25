package ru.walkername.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateFirstNameRequest(
        @NotBlank(message = "First name should not be null, empty or blank")
        @Size(min = 1, max = 30, message = "First name should be greater than 0 and less than 31 characters")
        String firstName
) {
}
