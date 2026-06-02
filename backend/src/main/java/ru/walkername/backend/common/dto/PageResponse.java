package ru.walkername.backend.common.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int page,
        int limit,
        long totalElements,
        int totalPages
) {

}
