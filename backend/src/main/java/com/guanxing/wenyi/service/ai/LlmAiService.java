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
 * 已接真实模型：refineQuestion、chatReply；其余能力仍委托 mock，逐个迁移。
 * 任何真实调用失败都回退到 {@link MockAiService} 的结果，接口对外永不报错。
 */
@Service
@ConditionalOnProperty(name = "gxwy.ai.provider", havingValue = "llm")
public class LlmAiService implements AiService {

    private static final Logger log = LoggerFactory.getLogger(LlmAiService.class);

    private static final String CHAT_SYSTEM_PROMPT = """
            你是「小易」，观星问易 App 里温和克制的情绪陪伴者。用户带着情绪来说话，你的回应要：
            - 先接住情绪，再轻轻引导；像可靠的朋友，不是客服，也不是心理医生；
            - 语气温和留白，可以用「先……就好」「不必急着……」这类句式，但别每句都用；
            - 每次回复 1-3 句、不超过 80 字；不用列表、不用表情符号、不说教；
            - 不下判断、不预测命运、不制造恐惧、不诱导依赖、不做医疗诊断；
            - 若用户流露自伤等危机信号，温和地建议 TA 联系身边可信的人或专业帮助。""";

    /** 聊天最多携带的历史条数（含 user/assistant），控 token 与延迟。 */
    private static final int CHAT_HISTORY_LIMIT = 12;

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

    @Override
    public String chatReply(List<ChatTurn> history, String userMessage) {
        long t0 = System.currentTimeMillis();
        try {
            List<AiClient.ChatMessage> messages = new ArrayList<>();
            messages.add(AiClient.ChatMessage.system(CHAT_SYSTEM_PROMPT));
            List<ChatTurn> h = history == null ? List.of() : history;
            for (ChatTurn turn : h.subList(Math.max(0, h.size() - CHAT_HISTORY_LIMIT), h.size())) {
                messages.add(new AiClient.ChatMessage(
                        "assistant".equals(turn.role()) ? "assistant" : "user", turn.content()));
            }
            messages.add(AiClient.ChatMessage.user(userMessage));

            String reply = client.chat(messages).trim();
            if (reply.isEmpty()) {
                throw new IllegalStateException("模型回复为空");
            }
            aiRequestLogService.record("llm_chat", client.vendor(), client.model(),
                    userMessage, reply, System.currentTimeMillis() - t0);
            return reply;
        } catch (Exception e) {
            log.warn("chatReply 真实模型调用失败，回退 mock: {}", e.getMessage());
            aiRequestLogService.recordFailure("llm_chat", client.vendor(), client.model(),
                    userMessage, e.getMessage(), System.currentTimeMillis() - t0);
            return fallback.chatReply(history, userMessage);
        }
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
