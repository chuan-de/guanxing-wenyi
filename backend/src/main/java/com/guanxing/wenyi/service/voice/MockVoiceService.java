package com.guanxing.wenyi.service.voice;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Map;

/** mock 转写：与前端 VoiceSheet 的 MOCK_TRANSCRIPT 一致。 */
@Service
@ConditionalOnProperty(name = "gxwy.voice.provider", havingValue = "mock", matchIfMissing = true)
public class MockVoiceService implements VoiceService {

    private static final Map<String, String> MOCK_TRANSCRIPT = Map.of(
            "ask", "最近这段关系让我有点累，常常不知道该继续往前，还是先停一停，先照顾一下自己。",
            "chat", "今天有点提不起劲，说不上为什么，就是觉得心里有点空。",
            "journal", "今天开了一整天会，挺累的。但傍晚走路回家时，风很轻，那一刻，我好像松了一口气。"
    );

    @Override
    public String providerName() {
        return "mock";
    }

    @Override
    public String transcribe(String context) {
        return MOCK_TRANSCRIPT.getOrDefault(context, MOCK_TRANSCRIPT.get("chat"));
    }
}
