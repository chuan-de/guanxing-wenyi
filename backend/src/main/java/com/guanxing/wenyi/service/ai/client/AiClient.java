package com.guanxing.wenyi.service.ai.client;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * AI 模型供应商抽象层（低层客户端）。
 * 只关心「把消息发给某个大模型并拿回内容」，不含任何业务语义；
 * 业务语义（改写问题/解卦/聊天……）在上层 {@link com.guanxing.wenyi.service.ai.AiService} 中。
 * 供应商实现：{@link DoubaoClient}（已接）、{@link DeepSeekClient}（预留）。
 * 上层代码只依赖本接口，不允许直接依赖具体厂商实现。
 */
public interface AiClient {

    /** 厂商标识（doubao / deepseek），用于 ai_request_log 的 provider 字段。 */
    String vendor();

    /** 实际使用的模型名。 */
    String model();

    /** 普通对话：返回 assistant 的文本内容。失败抛 {@link AiClientException}。 */
    String chat(List<ChatMessage> messages);

    /**
     * 结构化输出：强制模型输出 JSON（response_format=json_object），
     * 返回解析后的 JsonNode。内容为空或不是合法 JSON 时抛 {@link AiClientException}。
     */
    JsonNode structuredJson(List<ChatMessage> messages);

    /** 慢任务（长文生成，如月度报告）用：自定义读超时的结构化输出。 */
    JsonNode structuredJson(List<ChatMessage> messages, int timeoutMs);

    record ChatMessage(String role, String content) {
        public static ChatMessage system(String content) {
            return new ChatMessage("system", content);
        }

        public static ChatMessage user(String content) {
            return new ChatMessage("user", content);
        }
    }
}
