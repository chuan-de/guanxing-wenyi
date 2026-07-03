package com.guanxing.wenyi.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.guanxing.wenyi.service.AiRequestLogService;
import com.guanxing.wenyi.service.ai.client.AiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 真实大模型实现（gxwy.ai.provider=llm 时生效）。
 * 只依赖 {@link AiClient} 抽象，不感知具体厂商；厂商由 gxwy.ai.client 选择。
 * 第一批只有 refineQuestion 走真实模型，其余能力仍委托 mock，逐个迁移。
 * 任何真实调用失败都回退到 {@link MockAiService} 的结果，接口对外永不报错。
 */
@Service
@ConditionalOnProperty(name = "gxwy.ai.provider", havingValue = "llm")
public class LlmAiService implements AiService {

    private static final Logger log = LoggerFactory.getLogger(LlmAiService.class);

    private static final String REFINE_SYSTEM_PROMPT = """
            你是「小易」，一个温和克制的情绪陪伴者。用户会说出一个困扰，\
            你把它整理成 2-3 个「我可以如何……」式的问题，帮用户把模糊的困扰变成可以问自己的问题。
            要求：
            - 每个问题以第一人称提问，聚焦「我此刻最想看清什么 / 我可以如何照顾自己 / 我能迈出的最小一步」；
            - 语气温和，不下判断、不预测结局、不制造恐惧、不给医疗建议；
            - 每个问题不超过 32 个字，以问号结尾；
            - 只输出 JSON，格式：{"questions": ["…", "…", "…"]}""";

    private final AiClient client;
    private final AiRequestLogService aiRequestLogService;
    /** mock 实现无依赖，直接实例化作为兜底（provider=llm 时 mock 不注册为 Bean）。 */
    private final MockAiService fallback = new MockAiService();

    public LlmAiService(AiClient client, AiRequestLogService aiRequestLogService) {
        this.client = client;
        this.aiRequestLogService = aiRequestLogService;
        log.info("AiService 使用真实模型: vendor={}, model={}", client.vendor(), client.model());
    }

    @Override
    public String providerName() {
        return client.vendor();
    }

    @Override
    public String modelName() {
        return client.model();
    }

    @Override
    public List<String> refineQuestion(String question) {
        String t = question == null ? "" : question.trim();
        if (t.isEmpty()) {
            return fallback.refineQuestion(question); // 空输入没必要花一次真实调用
        }
        long t0 = System.currentTimeMillis();
        try {
            JsonNode json = client.structuredJson(List.of(
                    AiClient.ChatMessage.system(REFINE_SYSTEM_PROMPT),
                    AiClient.ChatMessage.user("困扰：「" + t + "」")));
            List<String> questions = parseQuestions(json);
            aiRequestLogService.record("llm_refine_question", client.vendor(), client.model(),
                    t, questions, System.currentTimeMillis() - t0);
            return questions;
        } catch (Exception e) {
            log.warn("refineQuestion 真实模型调用失败，回退 mock: {}", e.getMessage());
            aiRequestLogService.recordFailure("llm_refine_question", client.vendor(), client.model(),
                    t, e.getMessage(), System.currentTimeMillis() - t0);
            return fallback.refineQuestion(question);
        }
    }

    /** 校验模型输出：2-3 条非空问题，超出取前 3 条，不足 2 条视为失败。 */
    private static List<String> parseQuestions(JsonNode json) {
        JsonNode arr = json.path("questions");
        List<String> questions = new ArrayList<>();
        if (arr.isArray()) {
            for (JsonNode n : arr) {
                String q = n.asText("").trim();
                if (!q.isEmpty() && questions.size() < 3) {
                    questions.add(q);
                }
            }
        }
        if (questions.size() < 2) {
            throw new IllegalStateException("模型输出 questions 不足 2 条: " + json);
        }
        return questions;
    }

    /* ===== 以下能力尚未接真实模型，暂委托 mock，逐个迁移 ===== */

    @Override
    public CastResult cast(String question) {
        return fallback.cast(question);
    }

    @Override
    public ReadingResult interpret(String hexName, String changingToName) {
        return fallback.interpret(hexName, changingToName);
    }

    @Override
    public String chatReply(int priorUserMessages) {
        return fallback.chatReply(priorUserMessages);
    }

    @Override
    public RelationshipResult analyzeRelationship(String selfSign, String partnerSign) {
        return fallback.analyzeRelationship(selfSign, partnerSign);
    }

    @Override
    public TodayResult todayContent(LocalDate date) {
        return fallback.todayContent(date);
    }

    @Override
    public ReportContent buildReport(String periodId) {
        return fallback.buildReport(periodId);
    }
}
