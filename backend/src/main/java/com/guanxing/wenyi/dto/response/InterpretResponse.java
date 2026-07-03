package com.guanxing.wenyi.dto.response;

public record InterpretResponse(
        String divinationId,
        String hexName,
        String changingTo,
        ReadingDTO reading,
        String reflectQuestion,
        String summary
) {
}
