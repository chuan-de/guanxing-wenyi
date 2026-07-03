package com.guanxing.wenyi.service.ai.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 豆包（火山方舟 Ark）客户端，OpenAI 兼容协议。
 * API key 从环境变量 DOUBAO_API_KEY 读取（经 application.yml 注入）；
 * model 可用模型名或推理接入点 ep-xxx（环境变量 DOUBAO_MODEL）。
 */
@Component
@ConditionalOnProperty(name = "gxwy.ai.client", havingValue = "doubao", matchIfMissing = true)
public class DoubaoClient extends OpenAiCompatClient {

    public DoubaoClient(
            @Value("${gxwy.ai.doubao.base-url}") String baseUrl,
            @Value("${gxwy.ai.doubao.api-key}") String apiKey,
            @Value("${gxwy.ai.doubao.model}") String model,
            @Value("${gxwy.ai.timeout-ms:6000}") int timeoutMs) {
        super(baseUrl, apiKey, model, timeoutMs);
    }

    @Override
    public String vendor() {
        return "doubao";
    }

    /**
     * seed-1.6 系列是思考模型，默认开启 thinking 会带来数秒延迟；
     * 短任务（问题改写等）关掉思考，延迟从 ~6s+ 降到 <1s。
     */
    @Override
    protected void customizeBody(java.util.Map<String, Object> body) {
        if (String.valueOf(body.get("model")).contains("seed")) {
            body.put("thinking", java.util.Map.of("type", "disabled"));
        }
    }
}
