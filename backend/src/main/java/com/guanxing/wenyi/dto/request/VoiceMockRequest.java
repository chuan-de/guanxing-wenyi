package com.guanxing.wenyi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VoiceMockRequest(
        @NotBlank(message = "context 不能为空")
        @Pattern(regexp = "ask|chat|journal", message = "context 必须是 ask/chat/journal 之一")
        String context,
        Integer durationSec
) {
}
