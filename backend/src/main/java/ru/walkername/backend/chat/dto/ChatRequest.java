package ru.walkername.backend.chat.dto;

import jakarta.validation.constraints.Size;
import ru.walkername.backend.chat.entity.ChatType;

public record ChatRequest(
        @Size(min = 1, max = 100, message = "Chat name size should be greater than 1 and less than 101")
        String name,
        ChatType type
) {
}
