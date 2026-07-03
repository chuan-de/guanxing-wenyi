package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.dto.request.CastRequest;
import com.guanxing.wenyi.dto.request.InterpretRequest;
import com.guanxing.wenyi.dto.request.RefineQuestionRequest;
import com.guanxing.wenyi.dto.response.CastResponse;
import com.guanxing.wenyi.dto.response.DivinationRecordDTO;
import com.guanxing.wenyi.dto.response.InterpretResponse;
import com.guanxing.wenyi.dto.response.RefineQuestionResponse;
import com.guanxing.wenyi.service.DivinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "问卦")
@RestController
@RequestMapping("/api/divination")
public class DivinationController {

    private final DivinationService divinationService;

    public DivinationController(DivinationService divinationService) {
        this.divinationService = divinationService;
    }

    @Operation(summary = "小易整理问题（2-3 个）")
    @PostMapping("/refine-question")
    public ApiResponse<RefineQuestionResponse> refineQuestion(@Valid @RequestBody RefineQuestionRequest req) {
        return ApiResponse.ok(divinationService.refineQuestion(req.question()));
    }

    @Operation(summary = "起卦")
    @PostMapping("/cast")
    public ApiResponse<CastResponse> cast(@Valid @RequestBody CastRequest req) {
        return ApiResponse.ok(divinationService.cast(
                req.question(), req.questionType(), req.originalQuestion(), req.refinedQuestions()));
    }

    @Operation(summary = "卦象解读")
    @PostMapping("/interpret")
    public ApiResponse<InterpretResponse> interpret(@Valid @RequestBody InterpretRequest req) {
        return ApiResponse.ok(divinationService.interpret(req.divinationId()));
    }

    @Operation(summary = "最近问卦记录")
    @GetMapping("/records")
    public ApiResponse<List<DivinationRecordDTO>> records(
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok(divinationService.listRecords(limit));
    }
}
