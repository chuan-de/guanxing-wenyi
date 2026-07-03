package com.guanxing.wenyi.dto.response;

import java.util.Map;

public record RelationshipAnalyzeResponse(
        String id,
        HexagramDTO relationHexagram,
        RelationshipAnalysisDTO analysis,
        String closingLine,
        Map<String, Object> chart,
        long createdAt
) {
}
