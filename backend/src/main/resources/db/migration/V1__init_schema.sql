-- 观星问易 · 初始库表（PostgreSQL 16）
-- 主键 varchar(36) 存标准 UUID（应用层生成，与前端 crypto.randomUUID 对齐）
-- 时间 timestamptz；结构化字段 jsonb

-- 1. 用户 / mock 身份
CREATE TABLE user_profile (
    id               varchar(36) PRIMARY KEY,
    external_user_id varchar(64)  NOT NULL,
    display_name     varchar(64),
    is_anonymous     boolean      NOT NULL DEFAULT true,
    sun_sign         varchar(16),
    moon_sign        varchar(16),
    rising_sign      varchar(16),
    birth_year       int,
    birth_term       varchar(16),
    metadata         jsonb        NOT NULL DEFAULT '{}'::jsonb,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_user_profile_external ON user_profile (external_user_id);

-- 2. 问卦记录
CREATE TABLE divination_record (
    id                 varchar(36) PRIMARY KEY,
    user_id            varchar(36) NOT NULL REFERENCES user_profile (id),
    original_question  text,
    question           text        NOT NULL,
    question_type      varchar(16),
    hex_name           varchar(16) NOT NULL,
    hex_pinyin         varchar(16),
    hex_meaning        varchar(32),
    hex_lines          jsonb       NOT NULL,
    changing_lines     jsonb       NOT NULL DEFAULT '[]'::jsonb,
    changing_to_name   varchar(16),
    changing_to_pinyin varchar(16),
    reading_poem       text,
    reading_xiang      text,
    reading_yi         text,
    reading_xing       text,
    reflect_question   text,
    reading_summary    varchar(255),
    interpreted        boolean     NOT NULL DEFAULT false,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_div_user_created ON divination_record (user_id, created_at DESC);

-- 3. 小易会话
CREATE TABLE assistant_conversation (
    id               varchar(36) PRIMARY KEY,
    user_id          varchar(36) NOT NULL REFERENCES user_profile (id),
    title            varchar(128),
    context_snapshot jsonb       NOT NULL DEFAULT '{}'::jsonb,
    last_message_at  timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_conv_user_created ON assistant_conversation (user_id, created_at DESC);

-- 4. 聊天消息
CREATE TABLE assistant_message (
    id              varchar(36) PRIMARY KEY,
    conversation_id varchar(36) NOT NULL REFERENCES assistant_conversation (id),
    user_id         varchar(36) NOT NULL REFERENCES user_profile (id),
    role            varchar(16) NOT NULL,
    content         text        NOT NULL,
    seq             int         NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_conv_seq ON assistant_message (conversation_id, seq);

-- 5. 心境日记
CREATE TABLE mood_journal (
    id          varchar(36) PRIMARY KEY,
    user_id     varchar(36) NOT NULL REFERENCES user_profile (id),
    mood        varchar(16) NOT NULL,
    stress      smallint    NOT NULL CHECK (stress BETWEEN 0 AND 10),
    small_thing text,
    entry_date  date        NOT NULL DEFAULT current_date,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_journal_user_created ON mood_journal (user_id, created_at DESC);

-- 6. 姻缘 / 关系分析
CREATE TABLE relationship_profile (
    id                  varchar(36) PRIMARY KEY,
    user_id             varchar(36) NOT NULL REFERENCES user_profile (id),
    self_name           varchar(64),
    self_sign           varchar(16),
    self_birth          varchar(64),
    partner_name        varchar(64),
    partner_sign        varchar(16),
    partner_birth       varchar(64),
    relation_hex_name   varchar(16),
    relation_hex_pinyin varchar(16),
    relation_hex_lines  jsonb,
    analysis            jsonb       NOT NULL DEFAULT '{}'::jsonb,
    chart               jsonb       NOT NULL DEFAULT '{}'::jsonb,
    closing_line        text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rel_user_created ON relationship_profile (user_id, created_at DESC);

-- 7. 语音转写（mock）
CREATE TABLE voice_transcription (
    id           varchar(36) PRIMARY KEY,
    user_id      varchar(36) NOT NULL REFERENCES user_profile (id),
    context      varchar(16) NOT NULL,
    text         text        NOT NULL,
    duration_sec int,
    provider     varchar(24) NOT NULL DEFAULT 'mock',
    status       varchar(16) NOT NULL DEFAULT 'succeeded',
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_voice_user_created ON voice_transcription (user_id, created_at DESC);

-- 8. AI 调用审计
CREATE TABLE ai_request_log (
    id               varchar(36) PRIMARY KEY,
    user_id          varchar(36) REFERENCES user_profile (id),
    request_type     varchar(32) NOT NULL,
    provider         varchar(24) NOT NULL DEFAULT 'mock',
    model            varchar(48),
    request_payload  jsonb,
    response_payload jsonb,
    status           varchar(16) NOT NULL DEFAULT 'succeeded',
    error_message    text,
    latency_ms       int,
    created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ailog_user_created ON ai_request_log (user_id, created_at DESC);
CREATE INDEX idx_ailog_type_created ON ai_request_log (request_type, created_at DESC);
