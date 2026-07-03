package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.dto.response.TodayResponse;
import com.guanxing.wenyi.service.TodayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "今日")
@RestController
@RequestMapping("/api/today")
public class TodayController {

    private final TodayService todayService;

    public TodayController(TodayService todayService) {
        this.todayService = todayService;
    }

    @Operation(summary = "今日历法：星象/月相/今日一卦 + 近 7 天情绪轨迹")
    @GetMapping
    public ApiResponse<TodayResponse> today() {
        return ApiResponse.ok(todayService.today());
    }
}
