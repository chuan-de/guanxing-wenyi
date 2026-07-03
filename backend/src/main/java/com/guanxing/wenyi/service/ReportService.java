package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.guanxing.wenyi.common.BizException;
import com.guanxing.wenyi.common.ErrorCode;
import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.ReportResponse;
import com.guanxing.wenyi.entity.DivinationRecord;
import com.guanxing.wenyi.entity.MoodJournal;
import com.guanxing.wenyi.entity.RelationshipProfile;
import com.guanxing.wenyi.mapper.DivinationRecordMapper;
import com.guanxing.wenyi.mapper.MoodJournalMapper;
import com.guanxing.wenyi.mapper.RelationshipProfileMapper;
import com.guanxing.wenyi.service.ai.AiService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class ReportService {

    private static final Pattern PERIOD = Pattern.compile("\\d{4}-\\d{2}");
    private static final String DISCLAIMER =
            "本报告由占星与周易的象征语言生成，用于自我整理与反思，不构成命运预测或医疗建议。";

    private final AiService aiService;
    private final AiRequestLogService aiRequestLogService;
    private final DivinationRecordMapper divinationRecordMapper;
    private final MoodJournalMapper moodJournalMapper;
    private final RelationshipProfileMapper relationshipProfileMapper;

    public ReportService(AiService aiService, AiRequestLogService aiRequestLogService,
                         DivinationRecordMapper divinationRecordMapper,
                         MoodJournalMapper moodJournalMapper,
                         RelationshipProfileMapper relationshipProfileMapper) {
        this.aiService = aiService;
        this.aiRequestLogService = aiRequestLogService;
        this.divinationRecordMapper = divinationRecordMapper;
        this.moodJournalMapper = moodJournalMapper;
        this.relationshipProfileMapper = relationshipProfileMapper;
    }

    /** id 约定：latest（当前月）或 YYYY-MM（指定月）。报告即时聚合，不落表。 */
    public ReportResponse get(String id) {
        YearMonth period;
        if ("latest".equals(id)) {
            period = YearMonth.now();
        } else if (PERIOD.matcher(id).matches()) {
            period = YearMonth.parse(id);
        } else {
            throw new BizException(ErrorCode.PARAM_INVALID, "报告编号须为 latest 或 YYYY-MM");
        }
        long t0 = System.currentTimeMillis();
        String periodId = period.toString();

        ZoneId zone = ZoneId.systemDefault();
        OffsetDateTime from = period.atDay(1).atStartOfDay(zone).toOffsetDateTime();
        OffsetDateTime to = period.plusMonths(1).atDay(1).atStartOfDay(zone).toOffsetDateTime();
        String userId = UserContext.currentUserId();

        long divinationCount = divinationRecordMapper.selectCount(new QueryWrapper<DivinationRecord>()
                .eq("user_id", userId)
                .ge("created_at", from)
                .lt("created_at", to));
        List<String> divinationBriefs = divinationRecordMapper.selectList(new QueryWrapper<DivinationRecord>()
                        .eq("user_id", userId)
                        .ge("created_at", from)
                        .lt("created_at", to)
                        .orderByDesc("created_at")
                        .last("limit 5"))
                .stream()
                .map(r -> {
                    String hex = r.getHexName()
                            + (r.getChangingToName() != null ? "→" + r.getChangingToName() : "");
                    String question = r.getQuestion() == null ? "" : r.getQuestion();
                    if (question.length() > 20) {
                        question = question.substring(0, 20) + "…";
                    }
                    return hex + "（问：" + question + "）";
                })
                .toList();

        List<MoodJournal> journals = moodJournalMapper.selectList(new QueryWrapper<MoodJournal>()
                .select("entry_date", "mood")
                .eq("user_id", userId)
                .ge("entry_date", period.atDay(1))
                .lt("entry_date", period.plusMonths(1).atDay(1)));
        long moodDays = journals.stream().map(MoodJournal::getEntryDate).distinct().count();
        String dominantMood = journals.stream()
                .collect(java.util.stream.Collectors.groupingBy(MoodJournal::getMood,
                        java.util.stream.Collectors.counting()))
                .entrySet().stream()
                .max(java.util.Map.Entry.comparingByValue())
                .map(java.util.Map.Entry::getKey)
                .orElse(null);

        RelationshipProfile relation = relationshipProfileMapper.selectList(new QueryWrapper<RelationshipProfile>()
                        .eq("user_id", userId)
                        .orderByDesc("created_at")
                        .last("limit 1"))
                .stream().findFirst().orElse(null);

        AiService.ReportFacts facts = new AiService.ReportFacts(
                divinationCount, moodDays, dominantMood, divinationBriefs,
                relation == null ? null : relation.getRelationHexName(),
                relation == null ? null : relation.getClosingLine());
        AiService.ReportContent content = aiService.buildReport(periodId, facts);
        LocalDate today = LocalDate.now();
        String meta = "基于 " + divinationCount + " 次问卦 · " + moodDays + " 天心境 · 本命星盘　·　"
                + today.getMonthValue() + " 月 " + today.getDayOfMonth() + " 日";

        List<ReportResponse.SectionDTO> sections = content.sections().stream()
                .map(s -> new ReportResponse.SectionDTO(s.key(), s.index(), s.title(), s.body(), s.items()))
                .toList();
        ReportResponse resp = new ReportResponse(periodId, content.title(), meta, 6, sections, DISCLAIMER);
        aiRequestLogService.record("report", aiService.providerName(), aiService.modelName(),
                id, resp, System.currentTimeMillis() - t0);
        return resp;
    }
}
