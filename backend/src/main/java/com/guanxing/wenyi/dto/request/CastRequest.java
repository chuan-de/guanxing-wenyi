package com.guanxing.wenyi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CastRequest(
        @NotBlank(message = "question 不能为空")
        @Size(max = 500, message = "question 过长")
        String question,
        @Size(max = 16, message = "questionType 过长")
        String questionType,
        // 用户最初输入（refine 之前）；可空，缺省视为等于 question
        @Size(max = 500, message = "originalQuestion 过长")
        String originalQuestion,
        // 小易整理后的候选问题；可空
        List<String> refinedQuestions
) {
}
