package com.guanxing.wenyi.service.ai;

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

    /** 卦象解读：象 / 译 / 行 + 留给你的问题 + 摘要。 */
    ReadingResult interpret(String hexName, String changingToName);

    /** 小易聊天回复（priorUserMessages：本轮之前用户消息条数，用于轮询 mock）。 */
    String chatReply(int priorUserMessages);

    /** 姻缘分析。 */
    RelationshipResult analyzeRelationship(String selfSign, String partnerSign);

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
}
