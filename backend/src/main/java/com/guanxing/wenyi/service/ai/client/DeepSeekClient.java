package com.guanxing.wenyi.service.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * DeepSeek 客户端（预留，协议与豆包同为 OpenAI 兼容，未实测）。
 * 启用：GXWY_AI_CLIENT=deepseek + 环境变量 DEEPSEEK_API_KEY。
 */
@Component
@ConditionalOnProperty(name = "gxwy.ai.client", havingValue = "deepseek")
public class DeepSeekClient extends OpenAiCompatClient {

    public DeepSeekClient(
            @Value("${gxwy.ai.deepseek.base-url}") String baseUrl,
            @Value("${gxwy.ai.deepseek.api-key}") String apiKey,
            @Value("${gxwy.ai.deepseek.model}") String model,
            @Value("${gxwy.ai.timeout-ms:6000}") int timeoutMs) {
        super(baseUrl, apiKey, model, timeoutMs);
    }

    @Override
    public String vendor() {
        return "deepseek";
    }
}
