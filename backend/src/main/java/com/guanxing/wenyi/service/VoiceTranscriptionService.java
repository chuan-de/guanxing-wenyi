package com.guanxing.wenyi.service;

import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.VoiceTranscriptionResponse;
import com.guanxing.wenyi.entity.VoiceTranscription;
import com.guanxing.wenyi.mapper.VoiceTranscriptionMapper;
import com.guanxing.wenyi.service.voice.VoiceService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class VoiceTranscriptionService {

    private final VoiceService voiceService;
    private final AiRequestLogService aiRequestLogService;
    private final VoiceTranscriptionMapper voiceTranscriptionMapper;

    public VoiceTranscriptionService(VoiceService voiceService, AiRequestLogService aiRequestLogService,
                                     VoiceTranscriptionMapper voiceTranscriptionMapper) {
        this.voiceService = voiceService;
        this.aiRequestLogService = aiRequestLogService;
        this.voiceTranscriptionMapper = voiceTranscriptionMapper;
    }

    public VoiceTranscriptionResponse transcribeMock(String context, Integer durationSec) {
        long t0 = System.currentTimeMillis();
        String text = voiceService.transcribe(context);
        OffsetDateTime now = OffsetDateTime.now();

        VoiceTranscription entity = new VoiceTranscription();
        entity.setId(UUID.randomUUID().toString());
        entity.setUserId(UserContext.currentUserId());
        entity.setContext(context);
        entity.setText(text);
        entity.setDurationSec(durationSec);
        entity.setProvider(voiceService.providerName());
        entity.setStatus("succeeded");
        entity.setCreatedAt(now);
        voiceTranscriptionMapper.insert(entity);

        VoiceTranscriptionResponse resp = new VoiceTranscriptionResponse(
                entity.getId(), context, text, voiceService.providerName(),
                now.toInstant().toEpochMilli());
        aiRequestLogService.record("voice_mock", voiceService.providerName(), "mock",
                Map.of("context", context, "durationSec", durationSec == null ? -1 : durationSec),
                resp, System.currentTimeMillis() - t0);
        return resp;
    }
}
