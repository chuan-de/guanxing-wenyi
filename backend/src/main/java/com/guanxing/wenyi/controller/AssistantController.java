package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.dto.request.ChatRequest;
import com.guanxing.wenyi.dto.response.ChatResponse;
import com.guanxing.wenyi.service.AssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "小易聊天")
@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final AssistantService assistantService;

    public AssistantController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

    @Operation(summary = "与小易聊天（mock 回复）")
    @PostMapping("/chat")
    public ApiResponse<ChatResponse> chat(@Valid @RequestBody ChatRequest req) {
        return ApiResponse.ok(assistantService.chat(req.conversationId(), req.message()));
    }
}
