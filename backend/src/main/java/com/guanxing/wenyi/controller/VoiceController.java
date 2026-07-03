package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.dto.request.VoiceMockRequest;
import com.guanxing.wenyi.dto.response.VoiceTranscriptionResponse;
import com.guanxing.wenyi.service.VoiceTranscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "语音转写")
@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceTranscriptionService voiceTranscriptionService;

    public VoiceController(VoiceTranscriptionService voiceTranscriptionService) {
        this.voiceTranscriptionService = voiceTranscriptionService;
    }

    @Operation(summary = "语音转写（mock，不接真实 STT）")
    @PostMapping("/transcriptions/mock")
    public ApiResponse<VoiceTranscriptionResponse> transcribeMock(@Valid @RequestBody VoiceMockRequest req) {
        return ApiResponse.ok(voiceTranscriptionService.transcribeMock(req.context(), req.durationSec()));
    }
}
