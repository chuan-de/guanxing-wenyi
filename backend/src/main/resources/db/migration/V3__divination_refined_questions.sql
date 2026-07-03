-- 问卦记录：补存「小易整理后的候选问题」（原始输入 original_question 在 V1 已有）
ALTER TABLE divination_record
    ADD COLUMN refined_questions jsonb NOT NULL DEFAULT '[]'::jsonb;
