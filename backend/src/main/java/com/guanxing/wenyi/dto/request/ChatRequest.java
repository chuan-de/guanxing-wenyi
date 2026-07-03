package com.guanxing.wenyi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        // 首轮可为空，由后端创建会话
        String conversationId,
        @NotBlank(message = "message 不能为空")
        @Size(max = 2000, message = "message 过长")
        String message
) {
}
