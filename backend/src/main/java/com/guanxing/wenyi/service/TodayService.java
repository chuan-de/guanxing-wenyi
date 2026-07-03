package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.HexagramDTO;
import com.guanxing.wenyi.dto.response.TodayResponse;
import com.guanxing.wenyi.entity.MoodJournal;
import com.guanxing.wenyi.mapper.MoodJournalMapper;
import com.guanxing.wenyi.service.ai.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TodayService {

    private static final Logger log = LoggerFactory.getLogger(TodayService.class);

    private static final String[] DAY_LABELS = {"一", "二", "三", "四", "五", "六", "日"};

    private final AiService aiService;
    private final MoodJournalMapper moodJournalMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public TodayService(AiService aiService, MoodJournalMapper moodJournalMapper,
                        StringRedisTemplate stringRedisTemplate, ObjectMapper objectMapper) {
        this.aiService = aiService;
        this.moodJournalMapper = moodJournalMapper;
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public TodayResponse today() {
        LocalDate today = LocalDate.now();
        AiService.TodayResult content = calendarContent(today);

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
                content.moonSign(),
                content.moonElement(),
                new HexagramDTO(content.hexagram().name(), content.hexagram().pinyin(),
                        content.hexagram().meaning(), content.hexagram().lines()),
                content.hexagramNote(),
                track,
                moodSummary(entries));
    }

    /**
     * 历法部分（星象/月相/今日一卦+小注）全站同一天一致，按日缓存到 Redis
     * （llm 模式下小注是一次模型调用）；Redis 不可用时静默降级为直接计算。
     */
    private AiService.TodayResult calendarContent(LocalDate today) {
        String cacheKey = "gxwy:today:" + aiService.providerName() + ":" + today;
        try {
            String cached = stringRedisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, AiService.TodayResult.class);
            }
        } catch (Exception ex) {
            log.warn("读今日历法缓存失败，直接计算: {}", ex.getMessage());
        }
        AiService.TodayResult content = aiService.todayContent(today);
        try {
            Duration ttl = Duration.between(LocalDateTime.now(),
                    today.plusDays(1).atStartOfDay());
            if (!ttl.isNegative() && !ttl.isZero()) {
                stringRedisTemplate.opsForValue()
                        .set(cacheKey, objectMapper.writeValueAsString(content), ttl);
            }
        } catch (Exception ex) {
            log.warn("写今日历法缓存失败: {}", ex.getMessage());
        }
        return content;
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
