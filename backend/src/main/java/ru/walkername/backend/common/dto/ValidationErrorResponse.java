package ru.walkername.backend.common.dto;

import java.util.Map;

public record ValidationErrorResponse(
        String message,
        Map<String,String> fieldErrors,
        long timestamp
) {
}
