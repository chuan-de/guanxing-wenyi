package com.guanxing.wenyi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefineQuestionRequest(
        @NotBlank(message = "question 不能为空")
        @Size(max = 500, message = "question 过长")
        String question
) {
}
