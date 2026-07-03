package com.guanxing.wenyi.service;

import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.entity.AiRequestLog;
import com.guanxing.wenyi.mapper.AiRequestLogMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

/** 统一写 ai_request_log（mock 也记录，便于日后真实化后的可观测）。 */
@Service
public class AiRequestLogService {

    private static final Logger log = LoggerFactory.getLogger(AiRequestLogService.class);

    private final AiRequestLogMapper aiRequestLogMapper;

    public AiRequestLogService(AiRequestLogMapper aiRequestLogMapper) {
        this.aiRequestLogMapper = aiRequestLogMapper;
    }

    public void record(String requestType, String provider, String model,
                       Object requestPayload, Object responsePayload, long latencyMs) {
        try {
            AiRequestLog entry = new AiRequestLog();
            entry.setId(UUID.randomUUID().toString());
            entry.setUserId(UserContext.currentUserId());
            entry.setRequestType(requestType);
            entry.setProvider(provider);
            entry.setModel(model);
            entry.setRequestPayload(requestPayload);
            entry.setResponsePayload(responsePayload);
            entry.setStatus("succeeded");
            entry.setLatencyMs((int) latencyMs);
            entry.setCreatedAt(OffsetDateTime.now());
            aiRequestLogMapper.insert(entry);
        } catch (Exception ex) {
            // 审计失败不影响主流程
            log.warn("写 ai_request_log 失败: {}", ex.getMessage());
        }
    }
}
