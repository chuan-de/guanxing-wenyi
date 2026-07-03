package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.dto.response.ReportResponse;
import com.guanxing.wenyi.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "深度报告")
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(summary = "深度报告（latest 或 YYYY-MM，按用户数据即时聚合）")
    @GetMapping("/{id}")
    public ApiResponse<ReportResponse> get(@PathVariable String id) {
        return ApiResponse.ok(reportService.get(id));
    }
}
