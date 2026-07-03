package com.guanxing.wenyi.dto.response;

public record ChatMessageDTO(
        String id,
        String role,
        String content,
        long createdAt
) {
}
