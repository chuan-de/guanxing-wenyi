package com.guanxing.wenyi.dto.response;

import java.util.List;

/** 问卦历史记录（用于 GET /api/divination/records）。 */
public record DivinationRecordDTO(
        String id,
        String originalQuestion,
        String question,
        List<String> refinedQuestions,
        String hexName,
        String hexPinyin,
        String changingTo,
        String poem,
        String summary,
        boolean interpreted,
        long createdAt
) {
}
