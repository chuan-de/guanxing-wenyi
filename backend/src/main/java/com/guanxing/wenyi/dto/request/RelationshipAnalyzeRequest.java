package com.guanxing.wenyi.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record RelationshipAnalyzeRequest(
        @NotNull(message = "self 不能为空") @Valid Person self,
        @NotNull(message = "partner 不能为空") @Valid Person partner
) {
    public record Person(String name, String sign, String birth) {
    }
}
