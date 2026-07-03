package com.guanxing.wenyi.service;

import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.request.RelationshipAnalyzeRequest;
import com.guanxing.wenyi.dto.response.HexagramDTO;
import com.guanxing.wenyi.dto.response.RelationshipAnalysisDTO;
import com.guanxing.wenyi.dto.response.RelationshipAnalyzeResponse;
import com.guanxing.wenyi.entity.RelationshipProfile;
import com.guanxing.wenyi.mapper.RelationshipProfileMapper;
import com.guanxing.wenyi.service.ai.AiService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class RelationshipService {

    private final AiService aiService;
    private final AiRequestLogService aiRequestLogService;
    private final RelationshipProfileMapper relationshipProfileMapper;

    public RelationshipService(AiService aiService, AiRequestLogService aiRequestLogService,
                               RelationshipProfileMapper relationshipProfileMapper) {
        this.aiService = aiService;
        this.aiRequestLogService = aiRequestLogService;
        this.relationshipProfileMapper = relationshipProfileMapper;
    }

    public RelationshipAnalyzeResponse analyze(RelationshipAnalyzeRequest req) {
        long t0 = System.currentTimeMillis();
        RelationshipAnalyzeRequest.Person self = req.self();
        RelationshipAnalyzeRequest.Person partner = req.partner();

        AiService.RelationshipResult result =
                aiService.analyzeRelationship(self.sign(), partner.sign());

        OffsetDateTime now = OffsetDateTime.now();
        RelationshipProfile entity = new RelationshipProfile();
        entity.setId(UUID.randomUUID().toString());
        entity.setUserId(UserContext.currentUserId());
        entity.setSelfName(self.name());
        entity.setSelfSign(self.sign());
        entity.setSelfBirth(self.birth());
        entity.setPartnerName(partner.name());
        entity.setPartnerSign(partner.sign());
        entity.setPartnerBirth(partner.birth());
        entity.setRelationHexName(result.relationHexagram().name());
        entity.setRelationHexPinyin(result.relationHexagram().pinyin());
        entity.setRelationHexLines(result.relationHexagram().lines());

        Map<String, Object> analysis = new LinkedHashMap<>();
        analysis.put("attraction", result.attraction());
        analysis.put("care", result.care());
        analysis.put("communication", result.communication());
        entity.setAnalysis(analysis);
        entity.setChart(result.chart());
        entity.setClosingLine(result.closingLine());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        relationshipProfileMapper.insert(entity);

        RelationshipAnalyzeResponse resp = new RelationshipAnalyzeResponse(
                entity.getId(),
                new HexagramDTO(result.relationHexagram().name(), result.relationHexagram().pinyin(),
                        result.relationHexagram().meaning(), result.relationHexagram().lines()),
                new RelationshipAnalysisDTO(result.attraction(), result.care(), result.communication()),
                result.closingLine(),
                result.chart(),
                now.toInstant().toEpochMilli());
        aiRequestLogService.record("relationship_analyze", aiService.providerName(), aiService.modelName(),
                req, resp, System.currentTimeMillis() - t0);
        return resp;
    }
}
