package com.guanxing.wenyi.service.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * mock 实现：文案与前端 lib/store.tsx、ask 页、love 页保持一致，语气温和克制。
 * 仅当 gxwy.ai.provider=mock（默认）时生效。
 */
@Service
@ConditionalOnProperty(name = "gxwy.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiService implements AiService {

    private static final List<String> CHAT_REPLIES = List.of(
            "谢谢你愿意说出来。我们先不急着想清楚全部，把它放在这里，慢慢看就好。",
            "嗯，我听见了。此刻你不需要表现得很好，能照顾好自己，就已经很好。",
            "这件事先不急着下结论。今天，能为自己做一件很小的事吗？哪怕只是喝口水、走两步。",
            "我在的。你说的这些，并不小题大做——会这样累，说明你一直在认真生活。"
    );

    private static final HexagramData JIAN = new HexagramData(
            "风山渐", "Jiàn", "循序渐进", List.of(true, true, false, true, false, false));
    private static final HexagramData GUAN = new HexagramData(
            "风地观", "Guān", "静观其变", List.of(true, true, false, false, false, false));
    private static final HexagramData XIAN = new HexagramData(
            "泽山咸", "Xián", "无心而感", List.of(false, true, true, true, false, false));

    @Override
    public String providerName() {
        return "mock";
    }

    @Override
    public String modelName() {
        return "mock";
    }

    @Override
    public List<String> refineQuestion(String question) {
        String t = question == null ? "" : question.trim();
        if (t.isEmpty()) {
            return List.of(
                    "此刻，我最想为自己确认的，是什么？",
                    "如果只照顾好自己一件事，今天我想从哪里开始？");
        }
        String shortText = t.length() > 14 ? t.substring(0, 14) + "…" : t;
        return List.of(
                "在「" + shortText + "」这件事里，我此刻最想看清的，是什么？",
                "面对「" + shortText + "」，我可以如何先照顾好自己的感受？",
                "关于「" + shortText + "」，我能迈出的、最小的一步是什么？");
    }

    @Override
    public CastResult cast(String question) {
        // 第一阶段固定返回：风山渐 · 九三变 · 风地观
        return new CastResult(JIAN, List.of(3), GUAN, "水落石出非一夕，山木成荫待几春。");
    }

    @Override
    public ReadingResult interpret(String hexName, String changingToName) {
        return new ReadingResult(
                "渐，是循序渐进。它说的不是快或慢，而是按自己的次序来。",
                "你心里其实已有答案，只是它还需要一点时间长稳。那种「想快点确定」的着急，是很正常的——你只是太想好好对待这件事。",
                "先不急着下结论。今天只观察一件事：和 TA 在一起时，你的肩膀，是松的，还是紧的？记下来就好，不必马上解释。",
                "如果不必现在就给出答案，你最想先为自己守住的，是什么？",
                "渐，循序渐进——按自己的次序来。先观察，再决定。");
    }

    @Override
    public String chatReply(int priorUserMessages) {
        int idx = Math.floorMod(priorUserMessages, CHAT_REPLIES.size());
        return CHAT_REPLIES.get(idx);
    }

    @Override
    public RelationshipResult analyzeRelationship(String selfSign, String partnerSign) {
        Map<String, Object> chart = Map.of(
                "self", Map.of("venus", "巨蟹"),
                "partner", Map.of("mars", "狮子"));
        return new RelationshipResult(
                XIAN,
                "你的金星，与 TA 的火星轻轻相触——你们之间有一种不必刻意的吸引。在一起时，时间总是过得很快。",
                "你的月亮在水象，需要被靠近；TA 的月亮在火象，需要一点空间。这不是问题，只是两种不同的呼吸。",
                "当你想靠近、而 TA 想喘口气时，试着说出来，而不是猜。一句「我现在有点需要你」，胜过十次默默的等待。",
                "你们这段关系的功课：在亲密与独立之间，各自找到呼吸的位置。",
                chart);
    }
}
