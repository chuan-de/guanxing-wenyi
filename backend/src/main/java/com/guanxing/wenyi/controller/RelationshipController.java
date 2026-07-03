package com.guanxing.wenyi.controller;

import com.guanxing.wenyi.common.ApiResponse;
import com.guanxing.wenyi.dto.request.RelationshipAnalyzeRequest;
import com.guanxing.wenyi.dto.response.RelationshipAnalyzeResponse;
import com.guanxing.wenyi.service.RelationshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "姻缘")
@RestController
@RequestMapping("/api/relationship")
public class RelationshipController {

    private final RelationshipService relationshipService;

    public RelationshipController(RelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }

    @Operation(summary = "姻缘分析（mock）")
    @PostMapping("/analyze")
    public ApiResponse<RelationshipAnalyzeResponse> analyze(@Valid @RequestBody RelationshipAnalyzeRequest req) {
        return ApiResponse.ok(relationshipService.analyze(req));
    }
}
