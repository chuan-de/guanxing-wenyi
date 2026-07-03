package com.guanxing.wenyi.service.ai;

import com.guanxing.wenyi.service.HexagramTable;
import com.guanxing.wenyi.service.astro.AstroCalc;
import com.guanxing.wenyi.service.ai.AiService.HexagramData;
import com.guanxing.wenyi.service.ai.AiService.TodayResult;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

/**
 * 今日历法：真实天文计算（月亮星座/元素/月相）+ 产品语气模板文案 + 每日一卦（按日期轮换）。
 * 纯本地计算，mock 与 llm 共用；llm 只额外用模型润色「今日一卦」小注。
 */
public final class TodayCalendar {

    /** 元素 → 当日情绪基调（接在「X象当令。」之后）。 */
    private static final Map<String, String> ELEMENT_LINE = Map.of(
            "水", "情绪偏柔软，宜慢。",
            "火", "心气偏亮，宜动，也宜留一点余地。",
            "土", "情绪偏沉稳，宜整理手边的事。",
            "风", "思绪偏活跃，宜说出来，也宜写下来。");

    /** 月相 → 注脚（接在月相名之后）。 */
    private static final Map<String, String> PHASE_LINE = Map.of(
            "新月", "适合安放一个小小的新开始。",
            "娥眉月", "一点点生长，不必急。",
            "上弦月", "推进中，记得给自己留白。",
            "盈凸月", "接近圆满。适合把心里的事，慢慢收束。",
            "满月", "情绪容易被照亮，也容易被放大——温柔待己。",
            "亏凸月", "慢慢放下一些，留下重要的。",
            "下弦月", "适合清理与告别。",
            "残月", "歇一歇，等下一次新生。");

    private TodayCalendar() {
    }

    public static TodayResult compute(LocalDate date) {
        // 取当地正午做代表时刻（月亮每天走 ~13°，正午居中误差最小）
        Instant noon = date.atTime(12, 0).atZone(ZoneId.systemDefault()).toInstant();
        double jd = AstroCalc.julianDay(noon);

        int signIdx = AstroCalc.signIndex(AstroCalc.moonLongitude(jd));
        String sign = AstroCalc.SIGNS[signIdx];
        String element = AstroCalc.elementOf(signIdx);
        String phase = AstroCalc.moonPhase(AstroCalc.elongation(jd));

        String astroHeadline = "月在" + sign + "，" + element + "象当令。" + ELEMENT_LINE.get(element);
        String moonNote = phase + "，" + PHASE_LINE.get(phase);

        // 每日一卦：按日期在六十四卦中轮换，同一天全站一致
        HexagramData hexagram = HexagramTable.all()
                .get((int) Math.floorMod(date.toEpochDay(), 64));
        String note = "今天这一卦说的是「" + hexagram.meaning() + "」。不必用力，顺着它的节奏，先照顾好自己就好。";

        return new TodayResult(astroHeadline, moonNote, sign, element, hexagram, note);
    }
}
