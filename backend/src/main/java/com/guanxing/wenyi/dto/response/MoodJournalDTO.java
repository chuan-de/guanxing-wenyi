package com.guanxing.wenyi.dto.response;

public record MoodJournalDTO(
        String id,
        String mood,
        int stress,
        String smallThing,
        long createdAt
) {
}
