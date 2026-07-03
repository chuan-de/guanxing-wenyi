package com.guanxing.wenyi.service.ai;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    private static final HexagramData TUN = new HexagramData(
            "水雷屯", "Tún", "起步维艰", List.of(false, true, false, false, false, true));

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
    public ReadingResult interpret(String question, String hexName, String hexMeaning,
                                   List<Integer> changingLines, String changingToName) {
        return new ReadingResult(
                "渐，是循序渐进。它说的不是快或慢，而是按自己的次序来。",
                "你心里其实已有答案，只是它还需要一点时间长稳。那种「想快点确定」的着急，是很正常的——你只是太想好好对待这件事。",
                "先不急着下结论。今天只观察一件事：和 TA 在一起时，你的肩膀，是松的，还是紧的？记下来就好，不必马上解释。",
                "如果不必现在就给出答案，你最想先为自己守住的，是什么？",
                "渐，循序渐进——按自己的次序来。先观察，再决定。");
    }

    @Override
    public String chatReply(List<ChatTurn> history, String userMessage) {
        // 按此前用户消息条数轮询固定回复（与旧行为一致）
        int priorUserMessages = history == null ? 0
                : (int) history.stream().filter(t -> "user".equals(t.role())).count();
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

    @Override
    public TodayResult todayContent(LocalDate date) {
        // 第一阶段固定文案，与前端今日页原静态内容一致
        return new TodayResult(
                "月在巨蟹，水象当令。情绪偏柔软，宜慢。",
                "盈凸月，接近圆满。适合把心里的事，慢慢收束。",
                TUN,
                "起步总是最难的。今天不必急着突破——先扎下一点点根，就够了。");
    }

    @Override
    public ReportContent buildReport(String periodId, ReportFacts facts) {
        return new ReportContent(
                "在「慢」与「稳」之间，你正在学的事",
                List.of(
                        new ReportSection("astro", "01", "星盘分析",
                                "这段时间，月亮多次行经你的巨蟹宫——情绪会比平时更需要被照顾。你可能会发现，自己更容易被一些细小的事触动，也更想退回到熟悉、安全的地方。这不是脆弱，而是你天然的节律。\n\n"
                                        + "与此同时，你的上升天秤提醒你：在照顾别人和照顾自己之间，可以慢慢找回一点平衡。先把自己的感受，放回桌面上来。",
                                null),
                        new ReportSection("gua", "02", "卦象分析",
                                "两次问卦，都落在「渐」的主题上：循序渐进。鸿雁依次而飞，山上的树慢慢生长。它一再提醒的，不是「快或慢」，而是「按自己的次序来」。九三爻动，变为「观」——是时候先观察，而不是用力推进。\n\n"
                                        + "这一卦不是替你决定，而是帮你看见当下的重心：现在适合扎根，不必急着开花。",
                                null),
                        new ReportSection("mood", "03", "情绪主题",
                                "过去七天，你大多是「平静」的，偶尔疲惫。紧绷的峰值出现在周五——那天的会议和未被照顾的午餐，是身体先替你说出了累。整体看，你比自己以为的，走得更稳。这一周的情绪关键词，是「想被理解」。",
                                null),
                        new ReportSection("relation", "04", "关系建议",
                                "你与之珩之间，有一种不必勉强的呼应；需要照顾的，是两种不同的呼吸节奏。当你想靠近、而对方想喘口气时，试着把需要说出来，而不是猜。这不是谁对谁错，只是练习：在亲密与独立之间，各自找到位置。",
                                null),
                        new ReportSection("action", "05", "今日行动", null, List.of(
                                "今晚给自己十分钟，什么都不做，只是坐着。",
                                "和之珩说一句「我现在有点需要你」。",
                                "把那条拖了三天的消息，写下第一句话就好。")),
                        new ReportSection("reflect", "06", "反思问题",
                                "如果不必现在就给出答案，\n你最想先为自己守住的，是什么？",
                                null)));
    }
}
