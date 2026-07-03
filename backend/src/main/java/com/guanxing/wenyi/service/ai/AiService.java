package com.guanxing.wenyi.service.ai;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * AI 能力抽象（小易）。第一阶段只有 {@link MockAiService}；
 * 未来接真实 Claude 时新增实现并按 gxwy.ai.provider 切换，Controller/表结构/契约不变。
 */
public interface AiService {

    String providerName();

    String modelName();

    /** 把困扰整理成 2-3 个「我可以如何」式问题。 */
    List<String> refineQuestion(String question);

    /** 起卦：本卦 + 变爻 + 之卦 + 一句签诗。 */
    CastResult cast(String question);

    /**
     * 卦象解读：象 / 译 / 行 + 留给你的问题 + 摘要。
     * @param question      用户所问
     * @param hexName       本卦名
     * @param hexMeaning    本卦象意
     * @param changingLines 变爻（1-6，自下而上），可为空
     * @param changingToName 之卦名，可为 null
     */
    ReadingResult interpret(String question, String hexName, String hexMeaning,
                            List<Integer> changingLines, String changingToName);

    /**
     * 小易聊天回复。
     * @param history     本轮之前的完整对话（user/assistant，按时间正序）
     * @param userMessage 本轮用户输入
     */
    String chatReply(List<ChatTurn> history, String userMessage);

    /** 姻缘分析。 */
    RelationshipResult analyzeRelationship(String selfSign, String partnerSign);

    /** 今日历法：星象一句 + 月相注脚 + 今日一卦与小注。 */
    TodayResult todayContent(LocalDate date);

    /** 深度报告正文（6 段，key 与前端目录一致：astro/gua/mood/relation/action/reflect）。 */
    ReportContent buildReport(String periodId, ReportFacts facts);

    /** 报告的事实输入（按月聚合；无数据的字段为 0/null/空列表）。 */
    record ReportFacts(long divinationCount, long moodDays, String dominantMood,
                       List<String> divinationBriefs,
                       String relationHexName, String relationClosingLine) {
    }

    record ChatTurn(String role, String content) {
    }

    record HexagramData(String name, String pinyin, String meaning, List<Boolean> lines) {
    }

    record CastResult(HexagramData hexagram, List<Integer> changingLines,
                      HexagramData changingTo, String poem) {
    }

    record ReadingResult(String xiang, String yi, String xing,
                         String reflectQuestion, String summary) {
    }

    record RelationshipResult(HexagramData relationHexagram, String attraction, String care,
                              String communication, String closingLine, Map<String, Object> chart) {
    }

    record TodayResult(String astroHeadline, String moonNote,
                       HexagramData hexagram, String hexagramNote) {
    }

    /** 报告段落：正文段落用 \n\n 分隔；action 段用 items，其余段用 body。 */
    record ReportSection(String key, String index, String title, String body, List<String> items) {
    }

    record ReportContent(String title, List<ReportSection> sections) {
    }
}
