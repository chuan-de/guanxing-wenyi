package com.guanxing.wenyi.dto.request;

import jakarta.validation.constraints.NotBlank;

public record InterpretRequest(
        @NotBlank(message = "divinationId 不能为空")
        String divinationId
) {
}
