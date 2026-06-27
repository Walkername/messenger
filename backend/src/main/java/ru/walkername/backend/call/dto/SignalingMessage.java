package ru.walkername.backend.call.dto;

public record SignalingMessage(
        String from,
        String to,
        String type,
        Object payload
) {
}
