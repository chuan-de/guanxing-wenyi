package com.guanxing.wenyi.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.guanxing.wenyi.common.BizException;
import com.guanxing.wenyi.common.ErrorCode;
import com.guanxing.wenyi.common.UserContext;
import com.guanxing.wenyi.dto.response.CastResponse;
import com.guanxing.wenyi.dto.response.DivinationRecordDTO;
import com.guanxing.wenyi.dto.response.HexagramDTO;
import com.guanxing.wenyi.dto.response.InterpretResponse;
import com.guanxing.wenyi.dto.response.ReadingDTO;
import com.guanxing.wenyi.dto.response.RefineQuestionResponse;
import com.guanxing.wenyi.entity.DivinationRecord;
import com.guanxing.wenyi.mapper.DivinationRecordMapper;
import com.guanxing.wenyi.service.ai.AiService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DivinationService {

    private final AiService aiService;
    private final AiRequestLogService aiRequestLogService;
    private final DivinationRecordMapper divinationRecordMapper;

    public DivinationService(AiService aiService, AiRequestLogService aiRequestLogService,
                             DivinationRecordMapper divinationRecordMapper) {
        this.aiService = aiService;
        this.aiRequestLogService = aiRequestLogService;
        this.divinationRecordMapper = divinationRecordMapper;
    }

    public RefineQuestionResponse refineQuestion(String question) {
        long t0 = System.currentTimeMillis();
        List<String> questions = aiService.refineQuestion(question);
        RefineQuestionResponse resp = new RefineQuestionResponse(questions);
        aiRequestLogService.record("refine_question", aiService.providerName(), aiService.modelName(),
                question, resp, System.currentTimeMillis() - t0);
        return resp;
    }

    public CastResponse cast(String question, String questionType,
                             String originalQuestion, List<String> refinedQuestions) {
        long t0 = System.currentTimeMillis();
        AiService.CastResult result = aiService.cast(question);

        DivinationRecord record = new DivinationRecord();
        record.setId(UUID.randomUUID().toString());
        record.setUserId(UserContext.currentUserId());
        record.setQuestion(question);
        record.setOriginalQuestion(
                originalQuestion != null && !originalQuestion.isBlank() ? originalQuestion : question);
        record.setRefinedQuestions(refinedQuestions != null ? refinedQuestions : List.of());
        record.setQuestionType(questionType);
        record.setHexName(result.hexagram().name());
        record.setHexPinyin(result.hexagram().pinyin());
        record.setHexMeaning(result.hexagram().meaning());
        record.setHexLines(result.hexagram().lines());
        record.setChangingLines(result.changingLines());
        if (result.changingTo() != null) {
            record.setChangingToName(result.changingTo().name());
            record.setChangingToPinyin(result.changingTo().pinyin());
        }
        record.setReadingPoem(result.poem());
        record.setInterpreted(false);
        record.setCreatedAt(OffsetDateTime.now());
        record.setUpdatedAt(OffsetDateTime.now());
        divinationRecordMapper.insert(record);

        CastResponse resp = new CastResponse(
                record.getId(),
                question,
                toHexDTO(result.hexagram()),
                result.changingLines(),
                result.changingTo() == null ? null : toHexDTO(result.changingTo()),
                result.poem(),
                epochMillis(record.getCreatedAt()));
        aiRequestLogService.record("cast", aiService.providerName(), aiService.modelName(),
                question, resp, System.currentTimeMillis() - t0);
        return resp;
    }

    public InterpretResponse interpret(String divinationId) {
        long t0 = System.currentTimeMillis();
        DivinationRecord record = divinationRecordMapper.selectById(divinationId);
        if (record == null) {
            throw new BizException(ErrorCode.NOT_FOUND, "起卦记录不存在");
        }
        AiService.ReadingResult reading = aiService.interpret(
                record.getQuestion(), record.getHexName(), record.getHexMeaning(),
                record.getChangingLines(), record.getChangingToName());

        record.setReadingXiang(reading.xiang());
        record.setReadingYi(reading.yi());
        record.setReadingXing(reading.xing());
        record.setReflectQuestion(reading.reflectQuestion());
        record.setReadingSummary(reading.summary());
        record.setInterpreted(true);
        record.setUpdatedAt(OffsetDateTime.now());
        divinationRecordMapper.updateById(record);

        InterpretResponse resp = new InterpretResponse(
                record.getId(),
                record.getHexName(),
                record.getChangingToName(),
                new ReadingDTO(reading.xiang(), reading.yi(), reading.xing()),
                reading.reflectQuestion(),
                reading.summary());
        aiRequestLogService.record("interpret", aiService.providerName(), aiService.modelName(),
                divinationId, resp, System.currentTimeMillis() - t0);
        return resp;
    }

    /** 最近问卦记录（当前用户，按 createdAt 倒序，默认 10 条，上限 50）。 */
    public List<DivinationRecordDTO> listRecords(int limit) {
        int n = limit <= 0 ? 10 : Math.min(limit, 50);
        List<DivinationRecord> rows = divinationRecordMapper.selectList(
                new QueryWrapper<DivinationRecord>()
                        .eq("user_id", UserContext.currentUserId())
                        .orderByDesc("created_at")
                        .last("limit " + n));
        return rows.stream().map(DivinationService::toRecordDTO).toList();
    }

    private static DivinationRecordDTO toRecordDTO(DivinationRecord r) {
        return new DivinationRecordDTO(
                r.getId(),
                r.getOriginalQuestion(),
                r.getQuestion(),
                r.getRefinedQuestions() != null ? r.getRefinedQuestions() : List.of(),
                r.getHexName(),
                r.getHexPinyin(),
                r.getChangingToName(),
                r.getReadingPoem(),
                r.getReadingSummary(),
                Boolean.TRUE.equals(r.getInterpreted()),
                epochMillis(r.getCreatedAt()));
    }

    private static HexagramDTO toHexDTO(AiService.HexagramData h) {
        return new HexagramDTO(h.name(), h.pinyin(), h.meaning(), h.lines());
    }

    private static long epochMillis(OffsetDateTime t) {
        return t.toInstant().toEpochMilli();
    }
}
