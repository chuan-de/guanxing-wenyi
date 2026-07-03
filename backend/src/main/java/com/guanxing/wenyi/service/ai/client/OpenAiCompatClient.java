package com.guanxing.wenyi.service.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * OpenAI 兼容 /chat/completions 协议的通用实现。
 * 豆包（火山方舟 Ark）与 DeepSeek 均走此协议，子类只需提供 vendor 标识与配置。
 */
public abstract class OpenAiCompatClient implements AiClient {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RestClient http;
    private final String baseUrl;
    private final String apiKey;
    private final String model;

    protected OpenAiCompatClient(String baseUrl, String apiKey, String model, int timeoutMs) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.http = buildHttp(this.baseUrl, timeoutMs);
        this.apiKey = apiKey;
        this.model = model;
    }

    private static RestClient buildHttp(String baseUrl, int timeoutMs) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(Math.min(timeoutMs, 3000)));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));
        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    @Override
    public String model() {
        return model;
    }

    @Override
    public String chat(List<ChatMessage> messages) {
        return complete(http, messages, false);
    }

    @Override
    public JsonNode structuredJson(List<ChatMessage> messages) {
        return parseJson(complete(http, messages, true));
    }

    @Override
    public JsonNode structuredJson(List<ChatMessage> messages, int timeoutMs) {
        // 慢任务用一次性 client（报告等低频调用，构建开销可忽略）
        return parseJson(complete(buildHttp(baseUrl, timeoutMs), messages, true));
    }

    private JsonNode parseJson(String content) {
        try {
            return MAPPER.readTree(stripCodeFence(content));
        } catch (Exception e) {
            throw new AiClientException(vendor() + " 返回的内容不是合法 JSON: " + brief(content), e);
        }
    }

    private String complete(RestClient http, List<ChatMessage> messages, boolean jsonMode) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiClientException(vendor() + " API key 未配置（请设置对应环境变量）");
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        List<Map<String, String>> msgs = new ArrayList<>(messages.size());
        for (ChatMessage m : messages) {
            msgs.add(Map.of("role", m.role(), "content", m.content()));
        }
        body.put("messages", msgs);
        if (jsonMode) {
            body.put("response_format", Map.of("type", "json_object"));
        }
        customizeBody(body);

        String raw;
        try {
            // 读 byte[] 再按 UTF-8 解码：部分代理/网关会把响应 content-type 改成
            // application/octet-stream，直接取 String 会因找不到转换器而失败
            byte[] bytes = http.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(byte[].class);
            raw = bytes == null ? "" : new String(bytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new AiClientException(vendor() + " 调用失败: " + e.getMessage(), e);
        }

        try {
            JsonNode content = MAPPER.readTree(raw)
                    .path("choices").path(0).path("message").path("content");
            String text = content.asText("");
            if (text.isBlank()) {
                throw new AiClientException(vendor() + " 返回内容为空: " + brief(raw));
            }
            return text;
        } catch (AiClientException e) {
            throw e;
        } catch (Exception e) {
            throw new AiClientException(vendor() + " 响应解析失败: " + brief(raw), e);
        }
    }

    /** 子类可追加厂商私有请求参数（厂商差异必须封闭在 client 包内）。 */
    protected void customizeBody(Map<String, Object> body) {
    }

    /** 兼容模型偶尔把 JSON 包在 ```json ``` 代码围栏里的情况。 */
    private static String stripCodeFence(String s) {
        String t = s.trim();
        if (t.startsWith("```")) {
            int start = t.indexOf('\n');
            int end = t.lastIndexOf("```");
            if (start >= 0 && end > start) {
                t = t.substring(start + 1, end).trim();
            }
        }
        return t;
    }

    private static String brief(String s) {
        if (s == null) return "null";
        return s.length() > 200 ? s.substring(0, 200) + "…" : s;
    }
}
