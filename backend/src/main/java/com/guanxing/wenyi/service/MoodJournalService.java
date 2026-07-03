package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.guanxing.wenyi.common.PageResult;
import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.MoodJournalDTO;
import com.guanxing.wenyi.entity.MoodJournal;
import com.guanxing.wenyi.mapper.MoodJournalMapper;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MoodJournalService {

    private final MoodJournalMapper moodJournalMapper;

    public MoodJournalService(MoodJournalMapper moodJournalMapper) {
        this.moodJournalMapper = moodJournalMapper;
    }

    public MoodJournalDTO create(String mood, Integer stress, String smallThing) {
        OffsetDateTime now = OffsetDateTime.now();
        MoodJournal entity = new MoodJournal();
        entity.setId(UUID.randomUUID().toString());
        entity.setUserId(UserContext.currentUserId());
        entity.setMood(mood);
        entity.setStress(stress);
        entity.setSmallThing(smallThing == null ? null : smallThing.trim());
        entity.setEntryDate(now.toLocalDate());
        entity.setCreatedAt(now);
        moodJournalMapper.insert(entity);
        return toDTO(entity);
    }

    public PageResult<MoodJournalDTO> list(long page, long size, Integer days) {
        QueryWrapper<MoodJournal> wrapper = new QueryWrapper<MoodJournal>()
                .eq("user_id", UserContext.currentUserId());
        if (days != null && days > 0) {
            wrapper.ge("created_at", OffsetDateTime.now().minusDays(days));
        }
        wrapper.orderByDesc("created_at");

        IPage<MoodJournal> result = moodJournalMapper.selectPage(new Page<>(page, size), wrapper);
        List<MoodJournalDTO> records = result.getRecords().stream()
                .map(MoodJournalService::toDTO)
                .toList();
        return new PageResult<>(records, result.getTotal(), page, size);
    }

    private static MoodJournalDTO toDTO(MoodJournal e) {
        return new MoodJournalDTO(
                e.getId(),
                e.getMood(),
                e.getStress() == null ? 0 : e.getStress(),
                e.getSmallThing(),
                e.getCreatedAt().toInstant().toEpochMilli());
    }
}
