package com.guanxing.wenyi.dto.response;

/** 姻缘三段分析：吸引点 / 需要照顾的地方 / 沟通建议。 */
public record RelationshipAnalysisDTO(
        String attraction,
        String care,
        String communication
) {
}
