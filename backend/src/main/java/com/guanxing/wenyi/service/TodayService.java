package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.HexagramDTO;
import com.guanxing.wenyi.dto.response.TodayResponse;
import com.guanxing.wenyi.entity.MoodJournal;
import com.guanxing.wenyi.mapper.MoodJournalMapper;
import com.guanxing.wenyi.service.ai.AiService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TodayService {

    private static final String[] DAY_LABELS = {"一", "二", "三", "四", "五", "六", "日"};

    private final AiService aiService;
    private final MoodJournalMapper moodJournalMapper;

    public TodayService(AiService aiService, MoodJournalMapper moodJournalMapper) {
        this.aiService = aiService;
        this.moodJournalMapper = moodJournalMapper;
    }

    public TodayResponse today() {
        LocalDate today = LocalDate.now();
        AiService.TodayResult content = aiService.todayContent(today);

        LocalDate start = today.minusDays(6);
        List<MoodJournal> entries = moodJournalMapper.selectList(new QueryWrapper<MoodJournal>()
                .eq("user_id", UserContext.currentUserId())
                .ge("entry_date", start)
                .orderByAsc("created_at"));

        // 同一天多条记录时取最晚一条
        Map<LocalDate, MoodJournal> byDay = new HashMap<>();
        entries.forEach(e -> byDay.put(e.getEntryDate(), e));

        List<TodayResponse.MoodTrackDayDTO> track = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            LocalDate d = start.plusDays(i);
            MoodJournal e = byDay.get(d);
            track.add(new TodayResponse.MoodTrackDayDTO(
                    d.toString(),
                    DAY_LABELS[d.getDayOfWeek().getValue() - 1],
                    e == null ? null : e.getMood(),
                    e == null ? null : e.getStress()));
        }

        return new TodayResponse(
                today.toString(),
                content.astroHeadline(),
                content.moonNote(),
                new HexagramDTO(content.hexagram().name(), content.hexagram().pinyin(),
                        content.hexagram().meaning(), content.hexagram().lines()),
                content.hexagramNote(),
                track,
                moodSummary(entries));
    }

    private static String moodSummary(List<MoodJournal> entries) {
        if (entries.isEmpty()) {
            return "这七天还没有记录。想到什么的时候，随手写一笔就好。";
        }
        String dominant = entries.stream()
                .collect(Collectors.groupingBy(MoodJournal::getMood, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("平静");
        return "过去七天，你大多是「" + dominant + "」的。偶尔的起伏，也都好好走过来了。";
    }
}
