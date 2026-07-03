package com.guanxing.wenyi.service.voice;

/**
 * 语音转写抽象。注意：真实语音识别需另接 STT（非 Claude 能力）；
 * 第一阶段只有 {@link MockVoiceService}。
 */
public interface VoiceService {

    String providerName();

    /** 按上下文（ask/chat/journal）返回 mock 转写文本。 */
    String transcribe(String context);
}
