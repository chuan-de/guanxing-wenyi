# 观星问易 · 后端方案设计（backend-plan）

> 本文是**设计文档**，不含落地代码。目标：在不重写前端、不接真实 AI / 真实语音识别的前提下，给「观星问易」补一个 Java 后端，把目前前端 localStorage 里的 mock 数据与 mock AI 行为，迁移到一套真实可调用的接口上（AI / 语音先返回 mock，但接口形态与未来真实实现一致，留好替换点）。

---

## 1. 背景与现状（读前端得到的结论）

前端已是 **Next.js 14 + TypeScript + Tailwind** 初版，纯前端 + localStorage，无后端。关键事实（来自 `README.md` / `app` / `components` / `lib`）：

- **产品**：东西方结合的情绪陪伴 App。西方占星(天象/月相) + 东方易经卦象 + AI 伙伴「小易」。安全边界：不预测命运、不制造恐惧、不诱导依赖、不做医疗诊断。
- **页面**：落地页 `/`；工作台 `/app`(今日)、`/app/ask`(问卦)、`/app/chat`(小易聊天)、`/app/journal`(心境)、`/app/love`(姻缘)、`/app/report`(深度报告)、`/app/system`(设计系统)。
- **当前 mock 点（后端要接管的对象）**：
  - `lib/store.tsx`：聊天回复 `REPLIES`(写死轮询)、问题整理 `organizeQuestions`(2-3 个「我可以如何」式问题)。
  - `app/app/ask/page.tsx`：起卦结果与象/译/行解读写死（风山渐 → 九三变 → 风地观）。
  - `components/VoiceSheet.tsx`：语音转写 `MOCK_TRANSCRIPT`（ask/chat/journal 三种上下文各一句）。
  - `lib/storage.ts`：`DivinationRecord`、`JournalRecord` 存 localStorage。
- **前端现有数据结构（接口要对齐）**：
  - 卦象 `Hexagram`：`{ name, pinyin, meaning, lines: boolean[6] }`（`lines` 由上到下，true=阳实线 / false=阴断线）。变爻用 `number[]`（爻索引）。
  - `DivinationRecord`：`{ id:string, question, hexName, hexPinyin, changingTo?, reading, createdAt:number(epoch ms) }`。
  - `JournalRecord`：`{ id:string, mood, stress:0-10, smallThing, createdAt:number(epoch ms) }`。
  - 聊天消息 `ChatMsg`：`{ who:"xy"|"me", text }`。
  - 时间用 **epoch 毫秒**，id 用**字符串 UUID**（`crypto.randomUUID()`）。

> **契约原则**：后端响应里 `id` 保持字符串 UUID、`createdAt` 保持 **epoch 毫秒（long）**，从而前端 `relativeLabel(ts)` 等现有逻辑无需改动即可消费。后续若要切 ISO8601，再统一调整。

---

## 2. 技术栈与版本

| 组件 | 选型 | 版本（建议） |
|---|---|---|
| 语言 | Java | 21 (LTS) |
| 框架 | Spring Boot | 3.3.x |
| 构建 | Maven | 3.9+ |
| Web | spring-boot-starter-web | 随 BOM |
| 校验 | spring-boot-starter-validation | 随 BOM |
| ORM | MyBatis-Plus（`mybatis-plus-spring-boot3-starter`） | 3.5.7+ |
| 数据库 | PostgreSQL | 16 |
| 迁移 | Flyway（`flyway-core` + `flyway-database-postgresql`） | 10.x |
| 缓存 | Redis（spring-boot-starter-data-redis，Lettuce） | 7 |
| 文档 | springdoc-openapi（`springdoc-openapi-starter-webmvc-ui`） | 2.6.x |
| 辅助 | Lombok | 随 IDE/BOM |

> 注意：Flyway 10 起 PostgreSQL 支持被拆到 `flyway-database-postgresql`，需单独引入。MyBatis-Plus 在 Spring Boot 3 必须用 `mybatis-plus-spring-boot3-starter`（不是旧的 `mybatis-plus-boot-starter`）。

---

## 3. 整体架构与请求流

```
┌─────────────────────┐      HTTP / JSON (X-User-Id 头)      ┌──────────────────────────────┐
│  Next.js 前端        │  ─────────────────────────────────▶ │  Spring Boot 后端 (8080)      │
│  /app/* 页面          │                                      │  Controller → Service → Mapper │
│  fetch /api/*        │  ◀───────────────────────────────── │      │            │            │
└─────────────────────┘      Result<T> 统一信封               │      ▼            ▼            │
                                                              │  AiService     VoiceService    │
                                                              │  (MockAiService)(MockVoice)    │
                                                              └────────┬─────────────┬─────────┘
                                                                       ▼             ▼
                                                              PostgreSQL 16      Redis 7
                                                              (Flyway 管理)    (限流/今日缓存)
```

- **无复杂权限**：用 `X-User-Id` 请求头作为 mock 用户标识；缺失时落到 `anonymous`。拦截器解析/懒创建 `user_profile`，写入 `UserContext`(ThreadLocal)。
- **AI / 语音全部走接口抽象**：`AiService` / `VoiceService` 接口 + `Mock*` 实现。第一阶段只有 mock 实现；未来接真实 Claude / STT 只需新增实现并切换 `@Primary` 或配置开关，**Controller / 表结构 / 前端契约都不动**。
- **每次「AI 调用」落 `ai_request_log`**：把 mock 也当成一次 provider 调用记录（type/provider/model/payload/latency/status），这样真实化后天然有可观测性与审计。

---

## 4. 前端 ↔ 后端契约总览

| 前端动作 | 现 mock 位置 | 新后端接口 | 落库表 |
|---|---|---|---|
| 问卦·小易整理问题 | `organizeQuestions` | `POST /api/divination/refine-question` | `ai_request_log` |
| 问卦·按住起卦 | ask 页写死卦象 | `POST /api/divination/cast` | `divination_record`, `ai_request_log` |
| 问卦·完整解读 | ask 页写死象/译/行 | `POST /api/divination/interpret` | `divination_record`(更新), `ai_request_log` |
| 小易聊天 | `REPLIES` | `POST /api/assistant/chat` | `assistant_conversation`, `assistant_message`, `ai_request_log` |
| 心境·保存 | `addJournal` | `POST /api/mood-journals` | `mood_journal` |
| 心境/今日·读取轨迹与历史 | `loadJournals` | `GET /api/mood-journals` | `mood_journal` |
| 姻缘·分析 | love 页写死 | `POST /api/relationship/analyze` | `relationship_profile`, `ai_request_log` |
| 语音·转写(mock) | `MOCK_TRANSCRIPT` | `POST /api/voice/transcriptions/mock` | `voice_transcription`, `ai_request_log` |
| 深度报告 | report 页写死 | `GET /api/reports/{id}` | 由上述表聚合（不单独建表） |

> 今日工作台(`/app`)的「天象/月相/今日一卦」属于轻量「今日历法」展示，**第一批不单列接口**：最近问卦、情绪轨迹由 `GET /api/mood-journals` 与（可选）问卦列表组合；天象/月相先沿用前端静态文案，后续再加 `GET /api/today`。本文末「后续」列为扩展点。

---

## 5. 数据库设计（PostgreSQL 16）

设计约定：

- 主键 `id`：`uuid` 类型，应用层用 `java.util.UUID.randomUUID().toString()` 生成后插入（MyBatis-Plus `@TableId(type = IdType.INPUT)`），保证与前端 UUID 字符串一致。
- 时间列：`created_at` / `updated_at` 用 `timestamptz`，默认 `now()`；**API 出参序列化为 epoch 毫秒**（Jackson 全局配置 `WRITE_DATES_AS_TIMESTAMPS`），对齐前端。
- 复杂结构（卦爻、变爻、分析段落、上下文快照）用 `jsonb`，避免过早拆表。
- 软删除：统一 `deleted boolean default false`（MyBatis-Plus `@TableLogic`）。
- 每张业务表带 `user_id` 外键 + `(user_id, created_at desc)` 索引，支撑「我的历史」分页。

### 5.1 user_profile（用户 / mock 身份）

```sql
CREATE TABLE user_profile (
    id               uuid PRIMARY KEY,
    external_user_id varchar(64)  NOT NULL,          -- X-User-Id；anonymous 也存一行
    display_name     varchar(64),                    -- 林徐之
    is_anonymous     boolean      NOT NULL DEFAULT true,
    sun_sign         varchar(16),                    -- 太阳星座：双鱼
    moon_sign        varchar(16),                    -- 月亮星座：巨蟹
    rising_sign      varchar(16),                    -- 上升：天秤
    birth_year       int,                            -- 1992
    birth_term       varchar(16),                    -- 节气：春分
    metadata         jsonb        NOT NULL DEFAULT '{}'::jsonb,
    deleted          boolean      NOT NULL DEFAULT false,
    created_at       timestamptz  NOT NULL DEFAULT now(),
    updated_at       timestamptz  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_user_profile_external ON user_profile(external_user_id) WHERE deleted = false;
```

### 5.2 divination_record（问卦记录）

```sql
CREATE TABLE divination_record (
    id                uuid PRIMARY KEY,
    user_id           uuid NOT NULL REFERENCES user_profile(id),
    original_question text,                  -- 用户原始输入
    question          text NOT NULL,         -- 最终起卦问题（可能经 refine）
    question_type     varchar(16),           -- 关系/工作/方向/自我
    hex_name          varchar(16) NOT NULL,  -- 风山渐
    hex_pinyin        varchar(16),           -- Jiàn
    hex_meaning       varchar(32),           -- 循序渐进
    hex_lines         jsonb NOT NULL,        -- [true,true,false,true,false,false] 由上到下
    changing_lines    jsonb NOT NULL DEFAULT '[]'::jsonb, -- [3]
    changing_to_name  varchar(16),           -- 风地观（之卦）
    changing_to_pinyin varchar(16),
    reading_poem      text,                  -- 「水落石出非一夕，山木成荫待几春。」
    reading_xiang     text,                  -- 象 · 这一卦在说什么
    reading_yi        text,                  -- 译 · 此刻的你
    reading_xing      text,                  -- 行 · 今天的一件小事
    reflect_question  text,                  -- 留给你的问题
    reading_summary   varchar(255),          -- 列表展示用一句话
    interpreted       boolean NOT NULL DEFAULT false, -- 是否已生成完整解读
    deleted           boolean NOT NULL DEFAULT false,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_div_user_created ON divination_record(user_id, created_at DESC);
```

### 5.3 assistant_conversation（小易会话）

```sql
CREATE TABLE assistant_conversation (
    id              uuid PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES user_profile(id),
    title           varchar(128),            -- 可由首条消息生成
    context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, -- 今日天象/月相/最近一卦等
    last_message_at timestamptz,
    deleted         boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_conv_user_created ON assistant_conversation(user_id, created_at DESC);
```

### 5.4 assistant_message（聊天消息）

```sql
CREATE TABLE assistant_message (
    id              uuid PRIMARY KEY,
    conversation_id uuid NOT NULL REFERENCES assistant_conversation(id),
    user_id         uuid NOT NULL REFERENCES user_profile(id),
    role            varchar(16) NOT NULL,    -- user / assistant（前端 me/xy 映射）
    content         text NOT NULL,
    seq             int  NOT NULL,           -- 会话内顺序
    deleted         boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_conv_seq ON assistant_message(conversation_id, seq);
```

> role 取后端规范的 `user`/`assistant`；前端 `me`↔`user`、`xy`↔`assistant` 在适配层映射。

### 5.5 mood_journal（心境日记）

```sql
CREATE TABLE mood_journal (
    id          uuid PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES user_profile(id),
    mood        varchar(16) NOT NULL,        -- 平静/疲惫/烦躁/低落/期待/紧绷
    stress      smallint NOT NULL CHECK (stress BETWEEN 0 AND 10),
    small_thing text,                        -- 今日一件小事
    entry_date  date NOT NULL DEFAULT current_date,
    deleted     boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_journal_user_created ON mood_journal(user_id, created_at DESC);
CREATE INDEX idx_journal_user_date ON mood_journal(user_id, entry_date DESC);
```

### 5.6 relationship_profile（姻缘 / 关系分析）

```sql
CREATE TABLE relationship_profile (
    id                uuid PRIMARY KEY,
    user_id           uuid NOT NULL REFERENCES user_profile(id),
    self_name         varchar(64),           -- 你
    self_sign         varchar(16),           -- 双鱼
    self_birth        varchar(32),           -- 1992 · 春分 · 月在巨蟹
    partner_name      varchar(64),           -- 之珩
    partner_sign      varchar(16),           -- 天蝎
    partner_birth     varchar(32),           -- 1990 · 立冬 · 月在白羊
    relation_hex_name varchar(16),           -- 泽山咸（关系卦）
    relation_hex_pinyin varchar(16),
    relation_hex_lines jsonb,
    analysis          jsonb NOT NULL DEFAULT '{}'::jsonb, -- {attraction, care, communication}
    chart             jsonb NOT NULL DEFAULT '{}'::jsonb, -- 双盘交叠节点(占位/可视化数据)
    closing_line      text,                  -- 「在亲密与独立之间……」
    deleted           boolean NOT NULL DEFAULT false,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rel_user_created ON relationship_profile(user_id, created_at DESC);
```

### 5.7 voice_transcription（语音转写 mock）

```sql
CREATE TABLE voice_transcription (
    id           uuid PRIMARY KEY,
    user_id      uuid NOT NULL REFERENCES user_profile(id),
    context      varchar(16) NOT NULL,       -- ask / chat / journal
    text         text NOT NULL,              -- 转写文本（mock）
    duration_sec int,                        -- 录音时长（前端传入或 mock）
    provider     varchar(24) NOT NULL DEFAULT 'mock',
    status       varchar(16) NOT NULL DEFAULT 'succeeded',
    deleted      boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_voice_user_created ON voice_transcription(user_id, created_at DESC);
```

### 5.8 ai_request_log（AI 调用审计 / 可观测）

```sql
CREATE TABLE ai_request_log (
    id               uuid PRIMARY KEY,
    user_id          uuid REFERENCES user_profile(id),
    request_type     varchar(32) NOT NULL,   -- refine_question/cast/interpret/chat/relationship_analyze/voice_mock/report
    provider         varchar(24) NOT NULL DEFAULT 'mock',
    model            varchar(48),            -- mock / 未来 claude-opus-4-8 等
    request_payload  jsonb,
    response_payload jsonb,
    status           varchar(16) NOT NULL DEFAULT 'succeeded', -- succeeded/failed
    error_message    text,
    latency_ms       int,
    created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ailog_user_created ON ai_request_log(user_id, created_at DESC);
CREATE INDEX idx_ailog_type_created ON ai_request_log(request_type, created_at DESC);
```

### 5.9 实体关系（ER 概览）

```
user_profile 1───* divination_record
user_profile 1───* assistant_conversation 1───* assistant_message
user_profile 1───* mood_journal
user_profile 1───* relationship_profile
user_profile 1───* voice_transcription
user_profile 1───* ai_request_log
深度报告：聚合 divination_record + mood_journal + relationship_profile（不建表）
```

### 5.10 种子数据（Flyway V2__seed.sql 思路）

- `anonymous` 一行（`is_anonymous=true`）。
- 演示用户 `林徐之`：双鱼 / 月在巨蟹 / 上升天秤 / 1992 / 春分（对应前端左下角与姻缘页文案），`external_user_id='demo-user'`，便于联调时 `X-User-Id: demo-user` 拿到带数据的体验。

---

## 6. API 设计（第一批 9 个）

### 6.1 通用约定

- **Base path**：`/api`。
- **统一信封 `Result<T>`**：
  ```json
  { "code": 0, "msg": "ok", "data": { } }
  ```
  `code=0` 成功；非 0 为业务错误码；HTTP 状态码仍语义化（200/400/404/429/500）。前端适配层统一取 `.data`。
- **用户标识**：请求头 `X-User-Id: <string>`，缺省视为 `anonymous`。
- **错误码（示例）**：`0` ok，`1001` 参数校验失败，`1002` 资源不存在，`1003` 限流，`5000` 服务器内部错误。
- **校验**：所有入参 DTO 用 Spring Validation（`@NotBlank`/`@Size`/`@Min`/`@Max`），失败由 `GlobalExceptionHandler` 转 `code=1001`。
- **分页出参**：`{ "records": [...], "total": 123, "page": 1, "size": 20 }`（包装 MyBatis-Plus `IPage`）。
- **时间**：所有 `createdAt` 出参为 epoch 毫秒。

### 6.2 POST /api/divination/refine-question — 小易整理问题

把用户困扰整理成 2-3 个「我可以如何」式问题（替换 `organizeQuestions`）。

请求：
```json
{ "question": "这段关系，我该继续投入，还是先退一步？" }
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "questions": [
    "在「这段关系」这件事里，我此刻最想看清的，是什么？",
    "面对「这段关系」，我可以如何先照顾好自己的感受？",
    "关于「这段关系」，我能迈出的、最小的一步是什么？"
  ]
} }
```
落库：`ai_request_log(request_type=refine_question)`。mock 实现复用前端 `organizeQuestions` 同款规则（移植到 `MockAiService`）。

### 6.3 POST /api/divination/cast — 按住起卦

返回本卦 / 变爻 / 之卦，并落一条「未解读」的 `divination_record`。

请求：
```json
{ "question": "在这段关系里，此刻我最想照顾好的，是自己的哪一种感受？", "questionType": "关系" }
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "id": "f7c1…uuid",
  "question": "在这段关系里…",
  "hexagram": { "name": "风山渐", "pinyin": "Jiàn", "meaning": "循序渐进",
                "lines": [true,true,false,true,false,false] },
  "changingLines": [3],
  "changingTo": { "name": "风地观", "pinyin": "Guān",
                  "lines": [true,true,false,false,false,false] },
  "poem": "水落石出非一夕，山木成荫待几春。",
  "createdAt": 1782800000000
} }
```
落库：插入 `divination_record(interpreted=false)`；`ai_request_log(request_type=cast)`。mock：第一阶段固定返回「风山渐 · 九三变 · 风地观」（与前端一致），结构上保留随机起卦的扩展位（`MockAiService.cast()` 内可后续替换为真实摇卦算法）。

### 6.4 POST /api/divination/interpret — 完整解读

对某次起卦生成象/译/行 + 留给你的问题，并把解读回写记录（`interpreted=true`）。

请求：
```json
{ "divinationId": "f7c1…uuid" }
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "divinationId": "f7c1…uuid",
  "hexName": "风山渐", "changingTo": "风地观",
  "reading": {
    "xiang": "渐，是循序渐进。它说的不是快或慢，而是按自己的次序来。",
    "yi": "你心里其实已有答案，只是它还需要时间……",
    "xing": "先不急着下结论。只观察：和 TA 在一起时，你的肩膀是松的，还是紧的？"
  },
  "reflectQuestion": "如果不必现在就给出答案，你最想先为自己守住的，是什么？",
  "summary": "渐，循序渐进——按自己的次序来。先观察，再决定。"
} }
```
落库：更新对应 `divination_record` 的 `reading_*` / `reflect_question` / `reading_summary` / `interpreted=true`；`ai_request_log(request_type=interpret)`。
> 备选：若前端希望「起卦即出解读」，可让 `cast` 内部直接调用 interpret 逻辑并一次返回；本设计保留两步以贴合前端「起卦 → 听小易完整解读」的两段交互。

### 6.5 POST /api/assistant/chat — 小易聊天

请求（首轮不传 conversationId，后端创建会话）：
```json
{ "conversationId": null, "message": "有点累，说不上来为什么。" }
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "conversationId": "a91…uuid",
  "userMessageId": "…",
  "reply": { "id": "…", "role": "assistant",
             "content": "嗯，我听见了。此刻你不需要表现得很好…",
             "createdAt": 1782800001000 }
} }
```
落库：首轮建 `assistant_conversation`（写入 `context_snapshot`：今日天象/最近一卦等）；写两条 `assistant_message`(user + assistant)；`ai_request_log(request_type=chat)`。mock：`MockAiService.chat()` 复用前端 `REPLIES` 轮询逻辑（按用户消息计数取模），语气温和克制。
> 可选 `GET /api/assistant/conversations/{id}/messages` 用于刷新历史——非第一批，列为扩展。

### 6.6 POST /api/mood-journals — 保存心境

请求：
```json
{ "mood": "疲惫", "stress": 6, "smallThing": "傍晚走路回家，风很轻，松了一口气。" }
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "id": "…uuid", "mood": "疲惫", "stress": 6,
  "smallThing": "傍晚走路回家，风很轻，松了一口气。",
  "createdAt": 1782800002000
} }
```
落库：`mood_journal`。校验：`mood` 非空且属于枚举；`stress` 0–10。

### 6.7 GET /api/mood-journals — 心境列表 / 轨迹

Query：`?page=1&size=20`（或 `?days=7` 取近 7 天用于轨迹图）。
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "records": [
    { "id":"…", "mood":"疲惫", "stress":6, "smallThing":"…", "createdAt":1782800002000 }
  ],
  "total": 12, "page": 1, "size": 20
} }
```
按 `user_id` + `created_at desc`。前端「过去七天」「历史记录」「最近情绪轨迹」均消费此接口。

### 6.8 POST /api/relationship/analyze — 姻缘分析

请求：
```json
{
  "self":    { "name": "你",   "sign": "双鱼", "birth": "1992 · 春分 · 月在巨蟹" },
  "partner": { "name": "之珩", "sign": "天蝎", "birth": "1990 · 立冬 · 月在白羊" }
}
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "id": "…uuid",
  "relationHexagram": { "name": "泽山咸", "pinyin": "Xián",
                        "lines": [false,true,true,true,false,false] },
  "analysis": {
    "attraction":   "你的金星，与 TA 的火星轻轻相触——你们之间有一种不必刻意的吸引……",
    "care":         "你的月亮在水象，需要被靠近；TA 的月亮在火象，需要一点空间……",
    "communication":"当你想靠近、而 TA 想喘口气时，试着说出来，而不是猜……"
  },
  "closingLine": "你们这段关系的功课：在亲密与独立之间，各自找到呼吸的位置。",
  "chart": { "self": {"venus":"巨蟹"}, "partner": {"mars":"狮子"} },
  "createdAt": 1782800003000
} }
```
落库：`relationship_profile`；`ai_request_log(request_type=relationship_analyze)`。mock：返回前端 love 页同款三段文案 + 泽山咸。

### 6.9 POST /api/voice/transcriptions/mock — 语音转写（mock）

请求：
```json
{ "context": "journal", "durationSec": 12 }
```
响应：
```json
{ "code": 0, "msg": "ok", "data": {
  "id": "…uuid", "context": "journal",
  "text": "今天开了一整天会，挺累的。但傍晚走路回家时，风很轻，那一刻，我好像松了一口气。",
  "provider": "mock", "createdAt": 1782800004000
} }
```
落库：`voice_transcription`；`ai_request_log(request_type=voice_mock)`。mock：`MockVoiceService` 按 `context` 返回 `MOCK_TRANSCRIPT` 同款三句。
> 明确边界：真实语音识别**不是** Claude 能力，未来要接独立 STT（如 Whisper / 云端语音）。接口路径里带 `/mock` 正是为日后并存 `/api/voice/transcriptions`（真实）留位。

### 6.10 GET /api/reports/{id} — 深度报告

`{id}` 约定：`latest`（当前月）或 `YYYY-MM`（指定月）。报告由该用户的问卦 + 心境 + 关系分析**聚合生成**（不建表，可按需缓存到 Redis）。
响应（对齐 report 页 6 段目录）：
```json
{ "code": 0, "msg": "ok", "data": {
  "id": "2026-03",
  "title": "在「慢」与「稳」之间，你正在学的事",
  "meta": "基于 2 次问卦 · 7 天心境 · 本命星盘 · 三月二十",
  "readMinutes": 6,
  "sections": [
    { "key": "astro",    "index": "01", "title": "星盘分析", "body": "……" },
    { "key": "gua",      "index": "02", "title": "卦象分析", "body": "……" },
    { "key": "mood",     "index": "03", "title": "情绪主题", "body": "……" },
    { "key": "relation", "index": "04", "title": "关系建议", "body": "……" },
    { "key": "action",   "index": "05", "title": "今日行动", "items": ["……","……","……"] },
    { "key": "reflect",  "index": "06", "title": "反思问题", "body": "……" }
  ],
  "disclaimer": "本报告由占星与周易的象征语言生成，用于自我整理与反思，不构成命运预测或医疗建议。"
} }
```
mock：`MockAiService.report()` 用用户近一月数据填空（无数据则回退到 report 页现有静态文案），section key 与前端 `reportToc` 完全一致（astro/gua/mood/relation/action/reflect）。

---

## 7. mock AI / mock 语音 的抽象与替换点

```
service/ai/
  AiService.java            // 接口：refineQuestion / cast / interpret / chat / analyzeRelationship / buildReport
  MockAiService.java        // @Service（默认实现），移植前端 organizeQuestions/REPLIES/写死文案
  AiContentTemplates.java   // 集中存放 mock 文案与卦象常量（风山渐/风地观/泽山咸…）
service/voice/
  VoiceService.java         // 接口：transcribe(context, durationSec)
  MockVoiceService.java     // @Service，返回 MOCK_TRANSCRIPT 三句
```

- 切真实实现时：新增 `ClaudeAiService implements AiService`，用配置 `gxwy.ai.provider=mock|claude` + `@ConditionalOnProperty` 选择 Bean；表结构、Controller、前端契约零改动。
- 真实 STT 同理：新增 `WhisperVoiceService`，新增真实路径 `/api/voice/transcriptions`，`/mock` 保留。
- 每个实现都在 `ai_request_log` 落一条（`provider`/`model`/`latency_ms`/`status`），mock 也写——保证可观测性从第一天就在。

---

## 8. 跨域、用户上下文、Redis

- **CORS**：`WebMvcConfig` 允许 `http://localhost:3000`（dev）与未来线上域名；允许 `X-User-Id`、`Content-Type` 头。
- **用户上下文**：`UserContextInterceptor` 读 `X-User-Id` → 查/建 `user_profile` → 存 `UserContext`(ThreadLocal)，请求结束清理。Service 通过 `UserContext.currentUserId()` 取当前用户。
- **Redis 用途（第一批，克制使用）**：
  1. **接口限流**：聊天 / 起卦按 `userId` 滑动窗口（如聊天 30 次/分），命中返回 `code=1003`。
  2. **今日历法缓存**：天象/月相/今日一卦按日缓存（key `gxwy:today:{date}`，TTL 到当日结束），未来 `GET /api/today` 直接用。
  3. **报告缓存**：`gxwy:report:{userId}:{period}` 短 TTL，避免重复聚合。
  > 不在第一批引入分布式 session（无复杂权限）。

---

## 9. Docker Compose（PostgreSQL + Redis）

`docker-compose.yml`（项目根或 `backend/`）：

```yaml
services:
  postgres:
    image: postgres:16
    container_name: gxwy-postgres
    environment:
      POSTGRES_DB: guanxing_wenyi
      POSTGRES_USER: gxwy
      POSTGRES_PASSWORD: gxwy_dev_pwd
    ports:
      - "5432:5432"
    volumes:
      - gxwy_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gxwy -d guanxing_wenyi"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7
    container_name: gxwy-redis
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - gxwy_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  gxwy_pg_data:
  gxwy_redis_data:
```

> 仅起依赖中间件（PostgreSQL + Redis），后端应用第一阶段用 IDE / `mvn spring-boot:run` 本地跑，连接 `localhost:5432` / `localhost:6379`。后续可加 `backend` 服务（多阶段 Dockerfile + `depends_on` healthcheck）做整套容器化——列为扩展，不在第一批。

---

## 10. 后端目录结构与包结构

建议放在仓库 `backend/` 子目录（前端在根，互不干扰）：

```
backend/
├── pom.xml
├── docker-compose.yml                 # 也可放仓库根
└── src/
    ├── main/
    │   ├── java/com/guanxing/wenyi/
    │   │   ├── GuanxingWenyiApplication.java
    │   │   ├── common/
    │   │   │   ├── Result.java                 # 统一信封
    │   │   │   ├── PageResult.java             # 分页出参
    │   │   │   ├── ErrorCode.java              # 错误码枚举
    │   │   │   ├── BizException.java
    │   │   │   ├── GlobalExceptionHandler.java # @RestControllerAdvice
    │   │   │   ├── UserContext.java            # ThreadLocal
    │   │   │   └── UserContextInterceptor.java
    │   │   ├── config/
    │   │   │   ├── WebMvcConfig.java           # CORS + 拦截器注册
    │   │   │   ├── MyBatisPlusConfig.java      # 分页插件 + @TableLogic
    │   │   │   ├── RedisConfig.java
    │   │   │   ├── JacksonConfig.java          # 时间序列化为 epoch 毫秒
    │   │   │   └── OpenApiConfig.java          # springdoc 分组/标题
    │   │   ├── controller/
    │   │   │   ├── DivinationController.java   # refine-question / cast / interpret
    │   │   │   ├── AssistantController.java    # chat
    │   │   │   ├── MoodJournalController.java  # POST / GET
    │   │   │   ├── RelationshipController.java # analyze
    │   │   │   ├── VoiceController.java        # transcriptions/mock
    │   │   │   └── ReportController.java       # GET /{id}
    │   │   ├── service/
    │   │   │   ├── DivinationService.java (+ impl/)
    │   │   │   ├── AssistantService.java (+ impl/)
    │   │   │   ├── MoodJournalService.java (+ impl/)
    │   │   │   ├── RelationshipService.java (+ impl/)
    │   │   │   ├── VoiceService.java (+ impl/)
    │   │   │   ├── ReportService.java (+ impl/)
    │   │   │   ├── ai/   { AiService, MockAiService, AiContentTemplates }
    │   │   │   └── voice/{ VoiceTranscribeService, MockVoiceService }
    │   │   ├── mapper/                          # MyBatis-Plus BaseMapper
    │   │   │   ├── UserProfileMapper.java
    │   │   │   ├── DivinationRecordMapper.java
    │   │   │   ├── AssistantConversationMapper.java
    │   │   │   ├── AssistantMessageMapper.java
    │   │   │   ├── MoodJournalMapper.java
    │   │   │   ├── RelationshipProfileMapper.java
    │   │   │   ├── VoiceTranscriptionMapper.java
    │   │   │   └── AiRequestLogMapper.java
    │   │   ├── entity/                          # 8 张表对应实体（@TableName）
    │   │   └── dto/
    │   │       ├── request/   # 各接口入参 + Validation 注解
    │   │       └── response/  # 各接口出参（HexagramDTO/ReadingDTO/ReportDTO…）
    │   └── resources/
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-docker.yml
    │       └── db/migration/
    │           ├── V1__init_schema.sql          # 8 张表 + 索引
    │           └── V2__seed_users.sql           # anonymous + 林徐之
    └── test/java/com/guanxing/wenyi/            # 接口/服务单测
```

包命名：`com.guanxing.wenyi.*`。实体与 DTO 分离，Controller 只编排、Service 落业务、AI/语音走接口抽象。

---

## 11. 配置要点（application.yml 摘要）

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/guanxing_wenyi
    username: gxwy
    password: gxwy_dev_pwd
  data:
    redis:
      host: localhost
      port: 6379
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  jackson:
    # 时间序列化为 epoch 毫秒，对齐前端 createdAt
    serialization:
      write-dates-as-timestamps: true
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: true
      logic-not-delete-value: false
  configuration:
    map-underscore-to-camel-case: true
springdoc:
  swagger-ui:
    path: /swagger-ui.html
gxwy:
  ai:
    provider: mock        # mock | claude（预留）
  voice:
    provider: mock        # mock | whisper（预留）
server:
  port: 8080
```

Swagger UI：`http://localhost:8080/swagger-ui.html`；OpenAPI JSON：`/v3/api-docs`。

---

## 12. 开发步骤与构建命令

**前置**：JDK 21、Maven 3.9+、Docker。

1. **起中间件**
   ```bash
   docker compose up -d        # 拉起 postgres + redis
   docker compose ps           # 确认 healthy
   ```
2. **建后端骨架**：用 Spring Initializr 选 Web / Validation / Data Redis，手动加 MyBatis-Plus(spring-boot3 starter)、Flyway(core + database-postgresql)、PostgreSQL Driver、springdoc、Lombok。
3. **写 Flyway 迁移**：`V1__init_schema.sql`(本文第 5 节 DDL) + `V2__seed_users.sql`(第 5.10)。启动时自动迁移。
4. **实体/Mapper**：8 张表对应实体 + `BaseMapper`。
5. **公共层**：`Result` / `GlobalExceptionHandler` / `UserContextInterceptor` / `WebMvcConfig`(CORS)。
6. **AI/语音抽象**：`AiService` + `MockAiService`（移植 `organizeQuestions`/`REPLIES`/写死卦象与文案）、`VoiceService` + `MockVoiceService`。
7. **业务 Service + Controller**：按第 6 节 9 个接口逐个实现，每个「AI 动作」落 `ai_request_log`。
8. **联调**：Swagger 自测 → 前端 `fetch('http://localhost:8080/api/...')` 带 `X-User-Id: demo-user` 验证契约（暂不改前端业务逻辑，可先用浏览器/curl 验证）。
9. **校验构建**：

   ```bash
   # 启动依赖
   docker compose up -d

   # 编译 + 跑测试 + 打包
   cd backend
   mvn clean verify

   # 本地运行（dev profile）
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   # 或
   java -jar target/guanxing-wenyi-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

   # 冒烟
   curl -s -X POST http://localhost:8080/api/divination/refine-question \
     -H 'Content-Type: application/json' -H 'X-User-Id: demo-user' \
     -d '{"question":"这段关系，我该继续投入，还是先退一步？"}'
   ```

---

## 13. 与前端对接的落地顺序（建议）

不改前端业务逻辑的前提下，未来真正接通时的推进顺序（本批先把后端建好、可被调用即可）：

1. 心境(`POST/GET /api/mood-journals`)——最简单、强一致，先打通读写闭环。
2. 问卦三件套(refine → cast → interpret)——核心流程。
3. 小易聊天(chat)——多轮 + 会话落库。
4. 姻缘(analyze)、语音(mock)、报告(report)。

前端接入方式（后续任务，不在本设计实现）：在 `lib/` 增加一个 `api.ts`，把 `organizeQuestions`/`sendChat`/`saveJournal`/`saveDivination` 等从 localStorage 切到 `fetch /api/*`，保留 localStorage 作为离线回退。

---

## 14. 边界与后续扩展点（明确不做 / 以后做）

**本批不做**：真实 AI、真实语音识别、复杂鉴权/登录、前端改造、整套容器化(backend 服务)、`GET /api/today`、会话历史拉取接口。

**已留好的扩展位**：
- `AiService`/`VoiceService` 接口 + `gxwy.ai.provider`/`gxwy.voice.provider` 开关 → 平滑接真实 Claude / STT。
- `ai_request_log` → 真实化后直接有调用审计与成本/延迟观测。
- `user_profile.external_user_id` + 拦截器 → 以后接真实鉴权时，仅替换「如何得到 userId」，业务表不动。
- 报告聚合 + Redis 缓存 → 后续可升级为定时生成 / 持久化 `report` 表。
- `/api/voice/transcriptions/mock` 与未来 `/api/voice/transcriptions`（真实）并存。

---

> 小结：本设计在「不动前端、不接真实 AI/语音」的约束下，给出可直接落地的 Java 21 + Spring Boot 3 + PostgreSQL + Redis + Flyway + MyBatis-Plus 后端蓝图——8 张表、9 个接口、mock 在接口抽象之后、Docker Compose 起依赖、目录/构建/步骤齐全，且所有出参契约与前端现有数据结构对齐，可被前端直接调用。
```
