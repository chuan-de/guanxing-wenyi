package com.guanxing.wenyi.dto.response;

public record VoiceTranscriptionResponse(
        String id,
        String context,
        String text,
        String provider,
        long createdAt
) {
}
