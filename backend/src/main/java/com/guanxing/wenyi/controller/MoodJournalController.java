package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.common.PageResult;
import com.guanxing.wenyi.dto.request.MoodJournalRequest;
import com.guanxing.wenyi.dto.response.MoodJournalDTO;
import com.guanxing.wenyi.service.MoodJournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "心境日记")
@RestController
@RequestMapping("/api/mood-journals")
public class MoodJournalController {

    private final MoodJournalService moodJournalService;

    public MoodJournalController(MoodJournalService moodJournalService) {
        this.moodJournalService = moodJournalService;
    }

    @Operation(summary = "保存心境")
    @PostMapping
    public ApiResponse<MoodJournalDTO> create(@Valid @RequestBody MoodJournalRequest req) {
        return ApiResponse.ok(moodJournalService.create(req.mood(), req.stress(), req.smallThing()));
    }

    @Operation(summary = "心境列表 / 轨迹（days 取近 N 天）")
    @GetMapping
    public ApiResponse<PageResult<MoodJournalDTO>> list(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "20") long size,
            @RequestParam(required = false) Integer days) {
        return ApiResponse.ok(moodJournalService.list(page, size, days));
    }
}
