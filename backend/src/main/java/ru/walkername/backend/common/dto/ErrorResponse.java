package ru.walkername.backend.common.dto;

public record ErrorResponse(
        String message,
        long timestamp
) {
}
