package com.guanxing.wenyi.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.guanxing.wenyi.service.AiRequestLogService;
import com.guanxing.wenyi.service.ai.client.AiClient;
import com.guanxing.wenyi.service.ai.client.AiClientException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** 注意：JDK25 下 Mockito inline mock 不可用，统一用手写桩。 */
class LlmAiServiceTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** 记录调用次数的审计桩（绕过 DB）。 */
    static class RecordingLogService extends AiRequestLogService {
        int succeeded;
        int failed;

        RecordingLogService() {
            super(null);
        }

        @Override
        public void record(String requestType, String provider, String model,
                           Object requestPayload, Object responsePayload, long latencyMs) {
            succeeded++;
        }

        @Override
        public void recordFailure(String requestType, String provider, String model,
                                  Object requestPayload, String errorMessage, long latencyMs) {
            failed++;
        }
    }

    /** 手写桩客户端：按需返回固定 JSON 或抛异常。 */
    private static AiClient stubClient(String json, RuntimeException error) {
        return new AiClient() {
            @Override public String vendor() { return "doubao"; }
            @Override public String model() { return "test-model"; }
            @Override public String chat(List<ChatMessage> messages) { throw new UnsupportedOperationException(); }
            @Override public JsonNode structuredJson(List<ChatMessage> messages) {
                if (error != null) throw error;
                try {
                    return MAPPER.readTree(json);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        };
    }

    @Test
    void refineQuestionUsesModelOutput() {
        RecordingLogService logService = new RecordingLogService();
        LlmAiService service = new LlmAiService(
                stubClient("{\"questions\":[\"我可以如何先照顾好自己？\",\"我此刻最想看清的是什么？\"]}", null),
                logService);

        List<String> questions = service.refineQuestion("最近工作让我很累");

        assertEquals(List.of("我可以如何先照顾好自己？", "我此刻最想看清的是什么？"), questions);
        assertEquals(1, logService.succeeded);
        assertEquals(0, logService.failed);
    }

    @Test
    void refineQuestionFallsBackWhenClientFails() {
        RecordingLogService logService = new RecordingLogService();
        LlmAiService service = new LlmAiService(
                stubClient(null, new AiClientException("连接超时")), logService);

        List<String> questions = service.refineQuestion("最近这段关系让我有点累");

        // 回退到 mock：内容与 MockAiService 一致
        assertEquals(new MockAiService().refineQuestion("最近这段关系让我有点累"), questions);
        assertEquals(1, logService.failed);
        assertEquals(0, logService.succeeded);
    }

    @Test
    void refineQuestionFallsBackOnMalformedOutput() {
        RecordingLogService logService = new RecordingLogService();
        // questions 只有 1 条 → 视为不合法输出
        LlmAiService service = new LlmAiService(
                stubClient("{\"questions\":[\"只有一条？\"]}", null), logService);

        List<String> questions = service.refineQuestion("说不上来，就是有点空");

        assertEquals(new MockAiService().refineQuestion("说不上来，就是有点空"), questions);
        assertEquals(1, logService.failed);
    }

    @Test
    void refineQuestionCapsAtThreeAndFiltersBlank() {
        RecordingLogService logService = new RecordingLogService();
        LlmAiService service = new LlmAiService(
                stubClient("{\"questions\":[\"一？\",\"  \",\"二？\",\"三？\",\"四？\"]}", null), logService);

        assertEquals(List.of("一？", "二？", "三？"), service.refineQuestion("怎么办"));
    }

    @Test
    void blankQuestionSkipsModelCall() {
        RecordingLogService logService = new RecordingLogService();
        // 桩会在被调用时抛异常——若走到真实调用则 failed 会 +1
        LlmAiService service = new LlmAiService(
                stubClient(null, new IllegalStateException("不应被调用")), logService);

        List<String> questions = service.refineQuestion("   ");

        assertEquals(new MockAiService().refineQuestion("   "), questions);
        assertTrue(questions.size() >= 2);
        assertEquals(0, logService.failed);
        assertEquals(0, logService.succeeded);
    }
}
