package com.guanxing.wenyi.dto.response;

public record ChatResponse(
        String conversationId,
        String userMessageId,
        ChatMessageDTO reply
) {
}
