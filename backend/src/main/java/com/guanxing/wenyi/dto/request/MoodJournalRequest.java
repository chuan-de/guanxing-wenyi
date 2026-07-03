package com.guanxing.wenyi.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MoodJournalRequest(
        @NotBlank(message = "mood 不能为空")
        @Size(max = 16, message = "mood 过长")
        String mood,
        @NotNull(message = "stress 不能为空")
        @Min(value = 0, message = "stress 最小为 0")
        @Max(value = 10, message = "stress 最大为 10")
        Integer stress,
        @Size(max = 2000, message = "smallThing 过长")
        String smallThing
) {
}
