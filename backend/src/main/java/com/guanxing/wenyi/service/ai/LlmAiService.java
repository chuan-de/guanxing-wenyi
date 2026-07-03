package com.guanxing.wenyi.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.guanxing.wenyi.service.AiRequestLogService;
import com.guanxing.wenyi.service.HexagramTable;
import com.guanxing.wenyi.service.ai.client.AiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 真实大模型实现（gxwy.ai.provider=llm 时生效）。
 * 只依赖 {@link AiClient} 抽象，不感知具体厂商；厂商由 gxwy.ai.client 选择。
 * 已接真实模型：refineQuestion、chatReply、cast(签诗)、interpret、analyzeRelationship、buildReport；
 * todayContent（今日历法）仍为固定文案，待真实占星计算。
 * 起卦的卦与变爻由本地随机（HexagramTable 六十四卦），关系卦由双方星座稳定映射，均不经模型。
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

    private static final String FALLBACK_POEM = "水落石出非一夕，山木成荫待几春。";

    private static final String POEM_SYSTEM_PROMPT = """
            你是「小易」。请为一次问卦写一句签诗：两句七言，中间用中文逗号，句号结尾（形如「水落石出非一夕，山木成荫待几春。」）。
            要求：意象取自本卦卦名中的自然物与卦意，含蓄呼应用户的问题；不给结论、不预测吉凶、不用任何恐吓或负面断言的字眼。
            只输出签诗本身，不要引号、解释或其他文字。""";

    private static final String INTERPRET_SYSTEM_PROMPT = """
            你是「小易」，观星问易 App 里温和克制的解卦人。根据用户的问题与所得卦象，只输出 JSON：
            {"xiang":"…","yi":"…","xing":"…","reflectQuestion":"…","summary":"…"}
            各字段：
            - xiang：象——这一卦在说什么。1-2 句，从卦名象意讲起，白话、不掉书袋；
            - yi：译——此刻的用户。2-3 句，贴着 TA 的问题与处境，先体谅再轻轻点拨；
            - xing：行——今天可以做的一件很小的事。1-2 句，具体、门槛极低；
            - reflectQuestion：留给用户的一个开放式问题，以问号结尾；
            - summary：一句话摘要，不超过 40 字。
            铁律：不预测吉凶与结局、不制造恐惧、不诱导依赖、不给医疗/法律/投资建议；卦是镜子，不是答案。""";

    private static final String REFINE_SYSTEM_PROMPT = """
            你是「小易」，一个温和克制的情绪陪伴者。用户会说出一个困扰，\
            你把它整理成 2-3 个「我可以如何……」式的问题，帮用户把模糊的困扰变成可以问自己的问题。
            要求：
            - 每个问题以第一人称提问，聚焦「我此刻最想看清什么 / 我可以如何照顾自己 / 我能迈出的最小一步」；
            - 语气温和，不下判断、不预测结局、不制造恐惧、不给医疗建议；
            - 每个问题不超过 32 个字，以问号结尾；
            - 只输出 JSON，格式：{"questions": ["…", "…", "…"]}""";

    private static final String RELATION_SYSTEM_PROMPT = """
            你是「小易」，观星问易 App 里温和克制的关系陪伴者。根据两个人的星座与他们的关系卦，只输出 JSON：
            {"attraction":"…","care":"…","communication":"…","closingLine":"…"}
            - attraction：吸引点。1-2 句，从两人星座气质的共振或互补讲起，落在具体的相处感受上；
            - care：需要照顾的地方。1-2 句，温和指出节奏或需求的差异，「这不是问题，只是不同」的口吻；
            - communication：沟通建议。1-2 句，给一个具体可以说出口的句子示例；
            - closingLine：一句结语，以「你们这段关系的功课：」开头。
            铁律：不打分、不预测结局、不制造恐惧、不评判任何一方、不催促任何决定。""";

    /** 报告是长文生成，用单独的慢任务超时。 */
    private static final int REPORT_TIMEOUT_MS = 25_000;

    private static final String REPORT_SYSTEM_PROMPT = """
            你是「小易」。请为用户写一份本月的深度报告，只输出 JSON：
            {"title":"…","astro":"第一段\\n\\n第二段","gua":"第一段\\n\\n第二段","mood":"…","relation":"…","action":["…","…","…"],"reflect":"…"}
            - title：报告标题，不超过 18 字，有意象、不空洞，形如「在『慢』与『稳』之间，你正在学的事」；
            - astro：星盘分析，两段（用 \\n\\n 分隔）。用户演示星盘：太阳双鱼、月亮巨蟹、上升天秤。第一段讲本月情绪节律，第二段给一点平衡的提醒；
            - gua：卦象分析，两段。第一段基于本月问卦事实（若没有问卦，就温和地说说「还没问卦也没关系」并轻轻邀请）；第二段是一句可作引言的话（会被排成引言框）；
            - mood：情绪主题，一段。基于本月心境记录事实（若无记录则温和引导）；
            - relation：关系建议，一段。基于姻缘分析事实（若无则写一句关于「先照顾好自己」的通用陪伴）；
            - action：今日行动，恰好 3 条，每条一件门槛极低的具体小事；
            - reflect：一个开放式反思问题，可用 \\n 断行，以问号结尾。
            铁律：只依据给到的事实，不编造具体事件细节；不预测吉凶与结局、不制造恐惧、不诱导依赖、不给医疗/法律/投资建议。语气温和留白。""";

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

    /**
     * 起卦：卦与变爻本地随机（卦是摇出来的，不是模型挑的），签诗走真实模型。
     * 签诗失败只回退到通用签诗，不影响随机卦本身。
     */
    @Override
    public CastResult cast(String question) {
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        HexagramData hexagram = HexagramTable.random(rnd);
        int yao = rnd.nextInt(6) + 1;
        HexagramData changingTo = HexagramTable.change(hexagram, yao);
        return new CastResult(hexagram, List.of(yao), changingTo,
                castPoem(question, hexagram, yao, changingTo));
    }

    private String castPoem(String question, HexagramData hexagram, int yao, HexagramData changingTo) {
        long t0 = System.currentTimeMillis();
        try {
            String poem = client.chat(List.of(
                    AiClient.ChatMessage.system(POEM_SYSTEM_PROMPT),
                    AiClient.ChatMessage.user("问题：「" + question + "」\n本卦：" + hexagram.name()
                            + "（" + hexagram.meaning() + "），" + HexagramTable.yaoName(hexagram, yao)
                            + "爻动，之卦：" + changingTo.name() + "（" + changingTo.meaning() + "）。请写签诗。")))
                    .trim().replaceAll("\\s+", "");
            if (poem.isEmpty() || poem.length() > 40) {
                throw new IllegalStateException("签诗不合规: " + poem);
            }
            aiRequestLogService.record("llm_cast_poem", client.vendor(), client.model(),
                    question, poem, System.currentTimeMillis() - t0);
            return poem;
        } catch (Exception e) {
            log.warn("签诗真实模型调用失败，回退通用签诗: {}", e.getMessage());
            aiRequestLogService.recordFailure("llm_cast_poem", client.vendor(), client.model(),
                    question, e.getMessage(), System.currentTimeMillis() - t0);
            return FALLBACK_POEM;
        }
    }

    @Override
    public ReadingResult interpret(String question, String hexName, String hexMeaning,
                                   List<Integer> changingLines, String changingToName) {
        long t0 = System.currentTimeMillis();
        try {
            StringBuilder ctx = new StringBuilder("问题：「").append(question).append("」\n本卦：").append(hexName);
            if (hexMeaning != null && !hexMeaning.isBlank()) {
                ctx.append("（").append(hexMeaning).append("）");
            }
            if (changingLines != null && !changingLines.isEmpty()) {
                ctx.append("，第 ").append(changingLines.get(0)).append(" 爻（自下而上）动");
            }
            if (changingToName != null && !changingToName.isBlank()) {
                ctx.append("，之卦：").append(changingToName);
            }
            ctx.append("。");

            JsonNode json = client.structuredJson(List.of(
                    AiClient.ChatMessage.system(INTERPRET_SYSTEM_PROMPT),
                    AiClient.ChatMessage.user(ctx.toString())));
            ReadingResult reading = new ReadingResult(
                    requireText(json, "xiang"),
                    requireText(json, "yi"),
                    requireText(json, "xing"),
                    requireText(json, "reflectQuestion"),
                    requireText(json, "summary"));
            aiRequestLogService.record("llm_interpret", client.vendor(), client.model(),
                    Map.of("question", question, "hexName", hexName), reading,
                    System.currentTimeMillis() - t0);
            return reading;
        } catch (Exception e) {
            log.warn("interpret 真实模型调用失败，回退 mock: {}", e.getMessage());
            aiRequestLogService.recordFailure("llm_interpret", client.vendor(), client.model(),
                    Map.of("question", question, "hexName", hexName), e.getMessage(),
                    System.currentTimeMillis() - t0);
            return fallback.interpret(question, hexName, hexMeaning, changingLines, changingToName);
        }
    }

    private static String requireText(JsonNode json, String field) {
        String v = json.path(field).asText("").trim();
        if (v.isEmpty()) {
            throw new IllegalStateException("模型输出缺少字段 " + field + ": " + json);
        }
        return v;
    }

    @Override
    public RelationshipResult analyzeRelationship(String selfSign, String partnerSign) {
        // 同一对组合稳定映射到同一卦——关系卦不该每次刷新都变
        HexagramData hex = HexagramTable.all()
                .get(Math.floorMod((selfSign + "×" + partnerSign).hashCode(), 64));
        long t0 = System.currentTimeMillis();
        try {
            JsonNode json = client.structuredJson(List.of(
                    AiClient.ChatMessage.system(RELATION_SYSTEM_PROMPT),
                    AiClient.ChatMessage.user("你：" + selfSign + "；TA：" + partnerSign
                            + "；关系卦：" + hex.name() + "（" + hex.meaning() + "）。")));
            RelationshipResult result = new RelationshipResult(
                    hex,
                    requireText(json, "attraction"),
                    requireText(json, "care"),
                    requireText(json, "communication"),
                    requireText(json, "closingLine"),
                    Map.of("self", Map.of("sign", selfSign), "partner", Map.of("sign", partnerSign)));
            aiRequestLogService.record("llm_relationship", client.vendor(), client.model(),
                    Map.of("self", selfSign, "partner", partnerSign), result,
                    System.currentTimeMillis() - t0);
            return result;
        } catch (Exception e) {
            log.warn("analyzeRelationship 真实模型调用失败，回退 mock: {}", e.getMessage());
            aiRequestLogService.recordFailure("llm_relationship", client.vendor(), client.model(),
                    Map.of("self", selfSign, "partner", partnerSign), e.getMessage(),
                    System.currentTimeMillis() - t0);
            return fallback.analyzeRelationship(selfSign, partnerSign);
        }
    }

    @Override
    public ReportContent buildReport(String periodId, ReportFacts facts) {
        long t0 = System.currentTimeMillis();
        try {
            JsonNode json = client.structuredJson(List.of(
                    AiClient.ChatMessage.system(REPORT_SYSTEM_PROMPT),
                    AiClient.ChatMessage.user(reportFactsText(periodId, facts))), REPORT_TIMEOUT_MS);

            List<String> action = new ArrayList<>();
            for (JsonNode n : json.path("action")) {
                String item = n.asText("").trim();
                if (!item.isEmpty() && action.size() < 3) {
                    action.add(item);
                }
            }
            if (action.size() < 2) {
                throw new IllegalStateException("模型输出 action 不足 2 条: " + json);
            }
            ReportContent content = new ReportContent(
                    requireText(json, "title"),
                    List.of(
                            new ReportSection("astro", "01", "星盘分析", requireText(json, "astro"), null),
                            new ReportSection("gua", "02", "卦象分析", requireText(json, "gua"), null),
                            new ReportSection("mood", "03", "情绪主题", requireText(json, "mood"), null),
                            new ReportSection("relation", "04", "关系建议", requireText(json, "relation"), null),
                            new ReportSection("action", "05", "今日行动", null, action),
                            new ReportSection("reflect", "06", "反思问题", requireText(json, "reflect"), null)));
            aiRequestLogService.record("llm_report", client.vendor(), client.model(),
                    periodId, content, System.currentTimeMillis() - t0);
            return content;
        } catch (Exception e) {
            log.warn("buildReport 真实模型调用失败，回退 mock: {}", e.getMessage());
            aiRequestLogService.recordFailure("llm_report", client.vendor(), client.model(),
                    periodId, e.getMessage(), System.currentTimeMillis() - t0);
            return fallback.buildReport(periodId, facts);
        }
    }

    private static String reportFactsText(String periodId, ReportFacts facts) {
        StringBuilder sb = new StringBuilder("报告月份：").append(periodId).append("。\n本月事实：\n");
        sb.append("- 问卦 ").append(facts.divinationCount()).append(" 次");
        if (facts.divinationBriefs() != null && !facts.divinationBriefs().isEmpty()) {
            sb.append("，最近的几卦：").append(String.join("；", facts.divinationBriefs()));
        }
        sb.append("。\n- 心境记录 ").append(facts.moodDays()).append(" 天");
        if (facts.dominantMood() != null) {
            sb.append("，出现最多的情绪是「").append(facts.dominantMood()).append("」");
        }
        sb.append("。\n");
        if (facts.relationHexName() != null) {
            sb.append("- 姻缘分析：关系卦 ").append(facts.relationHexName());
            if (facts.relationClosingLine() != null) {
                sb.append("，上次的结语：").append(facts.relationClosingLine());
            }
            sb.append("。\n");
        } else {
            sb.append("- 本月没有做过姻缘分析。\n");
        }
        return sb.toString();
    }

    /* ===== 以下能力尚未接真实模型，暂委托 mock ===== */

    @Override
    public TodayResult todayContent(LocalDate date) {
        return fallback.todayContent(date);
    }
}
