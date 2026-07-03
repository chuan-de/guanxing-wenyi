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

        @Override public JsonNode structuredJson(List<ChatMessage> messages, int timeoutMs) {
            return structuredJson(messages);
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
    void castUsesLocalRandomHexagramAndModelPoem() {
        RecordingLogService logService = new RecordingLogService();
        StubClient client = new StubClient(null, "云开月见终有时，水到渠成不问期。", null);
        LlmAiService service = new LlmAiService(client, logService);

        AiService.CastResult r = service.cast("要不要换工作");

        assertEquals("云开月见终有时，水到渠成不问期。", r.poem());
        assertEquals(6, r.hexagram().lines().size());
        assertEquals(1, r.changingLines().size());
        // 之卦必须是本卦翻转变爻后的合法卦
        int yao = r.changingLines().get(0);
        assertEquals(com.guanxing.wenyi.service.HexagramTable.change(r.hexagram(), yao).name(),
                r.changingTo().name());
        assertEquals(1, logService.succeeded);
    }

    @Test
    void castFallsBackToGenericPoemOnClientError() {
        RecordingLogService logService = new RecordingLogService();
        LlmAiService service = new LlmAiService(
                new StubClient(null, null, new AiClientException("超时")), logService);

        AiService.CastResult r = service.cast("要不要换工作");

        // 卦本地随机不受影响，签诗回退通用句
        assertEquals("水落石出非一夕，山木成荫待几春。", r.poem());
        assertEquals(6, r.hexagram().lines().size());
        assertEquals(1, logService.failed);
    }

    @Test
    void interpretUsesModelJson() {
        RecordingLogService logService = new RecordingLogService();
        StubClient client = new StubClient(
                "{\"xiang\":\"象\",\"yi\":\"译\",\"xing\":\"行\",\"reflectQuestion\":\"想守住什么？\",\"summary\":\"摘要\"}",
                null, null);
        LlmAiService service = new LlmAiService(client, logService);

        AiService.ReadingResult r = service.interpret("该怎么走", "风山渐", "循序渐进", List.of(3), "风地观");

        assertEquals("象", r.xiang());
        assertEquals("想守住什么？", r.reflectQuestion());
        assertEquals(1, logService.succeeded);
        // 上下文应包含卦名与变爻信息
        String userMsg = client.lastMessages.get(1).content();
        assertTrue(userMsg.contains("风山渐") && userMsg.contains("第 3 爻") && userMsg.contains("风地观"));
    }

    @Test
    void interpretFallsBackOnMissingField() {
        RecordingLogService logService = new RecordingLogService();
        // 缺 summary 字段 → 回退 mock
        StubClient client = new StubClient(
                "{\"xiang\":\"象\",\"yi\":\"译\",\"xing\":\"行\",\"reflectQuestion\":\"？\"}", null, null);
        LlmAiService service = new LlmAiService(client, logService);

        AiService.ReadingResult r = service.interpret("该怎么走", "风山渐", "循序渐进", List.of(3), "风地观");

        assertEquals(new MockAiService().interpret("该怎么走", "风山渐", "循序渐进", List.of(3), "风地观"), r);
        assertEquals(1, logService.failed);
    }

    @Test
    void relationshipHexagramIsStablePerPairAndUsesModelText() {
        RecordingLogService logService = new RecordingLogService();
        String json = "{\"attraction\":\"吸引\",\"care\":\"照顾\",\"communication\":\"沟通\",\"closingLine\":\"你们这段关系的功课：慢一点。\"}";
        LlmAiService service = new LlmAiService(new StubClient(json, null, null), logService);

        AiService.RelationshipResult r1 = service.analyzeRelationship("双鱼", "天蝎");
        AiService.RelationshipResult r2 = service.analyzeRelationship("双鱼", "天蝎");

        assertEquals("吸引", r1.attraction());
        assertEquals("你们这段关系的功课：慢一点。", r1.closingLine());
        // 同一对组合 → 关系卦稳定，不随刷新变化
        assertEquals(r1.relationHexagram().name(), r2.relationHexagram().name());
        assertEquals(6, r1.relationHexagram().lines().size());
        assertEquals(2, logService.succeeded);
    }

    @Test
    void relationshipFallsBackOnClientError() {
        RecordingLogService logService = new RecordingLogService();
        LlmAiService service = new LlmAiService(
                new StubClient(null, null, new AiClientException("超时")), logService);

        AiService.RelationshipResult r = service.analyzeRelationship("双鱼", "天蝎");

        assertEquals("泽山咸", r.relationHexagram().name()); // mock 固定卦
        assertEquals(1, logService.failed);
    }

    @Test
    void buildReportUsesModelJson() {
        RecordingLogService logService = new RecordingLogService();
        String json = "{\"title\":\"标题\",\"astro\":\"一\\n\\n二\",\"gua\":\"一\\n\\n二\",\"mood\":\"情绪\","
                + "\"relation\":\"关系\",\"action\":[\"A\",\"B\",\"C\"],\"reflect\":\"想守住什么？\"}";
        StubClient client = new StubClient(json, null, null);
        LlmAiService service = new LlmAiService(client, logService);
        AiService.ReportFacts facts = new AiService.ReportFacts(
                2, 7, "平静", List.of("风山渐→风地观（问：这段关系…）"), "泽山咸", "功课：呼吸。");

        AiService.ReportContent content = service.buildReport("2026-07", facts);

        assertEquals("标题", content.title());
        assertEquals(6, content.sections().size());
        assertEquals(List.of("A", "B", "C"), content.sections().get(4).items());
        assertEquals("reflect", content.sections().get(5).key());
        // 事实应进入 user prompt
        String userMsg = client.lastMessages.get(1).content();
        assertTrue(userMsg.contains("问卦 2 次") && userMsg.contains("平静") && userMsg.contains("泽山咸"));
        assertEquals(1, logService.succeeded);
    }

    @Test
    void buildReportFallsBackOnMissingSection() {
        RecordingLogService logService = new RecordingLogService();
        String json = "{\"title\":\"标题\",\"astro\":\"一\",\"gua\":\"一\",\"mood\":\"情绪\","
                + "\"relation\":\"关系\",\"action\":[\"A\",\"B\"]}"; // 缺 reflect
        LlmAiService service = new LlmAiService(new StubClient(json, null, null), logService);
        AiService.ReportFacts facts = new AiService.ReportFacts(0, 0, null, List.of(), null, null);

        AiService.ReportContent content = service.buildReport("2026-07", facts);

        assertEquals(new MockAiService().buildReport("2026-07", facts).title(), content.title());
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
