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

    /** 手写桩客户端：按需返回固定 JSON/聊天文本或抛异常，并记录最后一次收到的消息。 */
    static class StubClient implements AiClient {
        private final String json;
        private final String chatText;
        private final RuntimeException error;
        List<ChatMessage> lastMessages;

        StubClient(String json, String chatText, RuntimeException error) {
            this.json = json;
            this.chatText = chatText;
            this.error = error;
        }

        @Override public String vendor() { return "doubao"; }
        @Override public String model() { return "test-model"; }

        @Override public String chat(List<ChatMessage> messages) {
            lastMessages = messages;
            if (error != null) throw error;
            return chatText;
        }

        @Override public JsonNode structuredJson(List<ChatMessage> messages) {
            lastMessages = messages;
            if (error != null) throw error;
            try {
                return MAPPER.readTree(json);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

    private static AiClient stubClient(String json, RuntimeException error) {
        return new StubClient(json, null, error);
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
    void chatReplyUsesModelOutputAndTrimsHistory() {
        RecordingLogService logService = new RecordingLogService();
        StubClient client = new StubClient(null, "我在的。先坐一会儿，喝口水，就好。", null);
        LlmAiService service = new LlmAiService(client, logService);

        // 构造 20 条历史，应只带最近 12 条 + system + 本轮 user = 14 条
        List<AiService.ChatTurn> history = new java.util.ArrayList<>();
        for (int i = 0; i < 10; i++) {
            history.add(new AiService.ChatTurn("user", "消息" + i));
            history.add(new AiService.ChatTurn("assistant", "回复" + i));
        }

        String reply = service.chatReply(history, "今天有点提不起劲");

        assertEquals("我在的。先坐一会儿，喝口水，就好。", reply);
        assertEquals(14, client.lastMessages.size());
        assertEquals("system", client.lastMessages.get(0).role());
        assertEquals("今天有点提不起劲", client.lastMessages.get(13).content());
        assertEquals(1, logService.succeeded);
    }

    @Test
    void chatReplyFallsBackWhenClientFails() {
        RecordingLogService logService = new RecordingLogService();
        LlmAiService service = new LlmAiService(
                new StubClient(null, null, new AiClientException("超时")), logService);

        List<AiService.ChatTurn> history = List.of(
                new AiService.ChatTurn("user", "你好"),
                new AiService.ChatTurn("assistant", "我在的"));
        String reply = service.chatReply(history, "今天有点累");

        assertEquals(new MockAiService().chatReply(history, "今天有点累"), reply);
        assertEquals(1, logService.failed);
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
