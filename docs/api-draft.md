# 观星问易 · API 文档

后端 Spring Boot，base `http://localhost:8080/api`。在线文档：服务启动后访问 `/swagger-ui.html`。
本文与代码同步于 2026-07-03（11 个接口全部已实现并与前端打通）。

## 通用约定

- **身份**：请求头 `X-User-Id`（前端默认 `demo-user`；缺省落到 `anonymous`）。无鉴权，拦截器懒创建 `user_profile`。
- **统一信封**：`{ "code": 0, "message": "ok", "data": ... }`，`code=0` 成功。
- **错误码**：`1001` 参数校验失败 / `1002` 资源不存在 / `1003` 限流 / `5000` 服务器内部错误。
- **格式**：id 为 UUID 字符串；`createdAt` 为 epoch 毫秒；卦象 `lines` 为 6 个布尔（**由上到下**，true=阳爻）。
- **CORS**：仅允许 `http://localhost:3000`。
- AI/语音目前均为 mock 实现，每次调用都写 `ai_request_log`（可观测性从第一天就在）。

`HexagramDTO = { name, pinyin, meaning, lines: boolean[6] }`

---

## 问卦

### POST /divination/refine-question
把困扰整理成 2-3 个「我可以如何」式问题。
```json
// 请求
{ "question": "这段关系我该继续投入，还是先退一步？" }
// data
{ "questions": ["在「…」这件事里，我此刻最想看清的，是什么？", "…", "…"] }
```

### POST /divination/cast
起卦并持久化（mock 固定：风山渐 · 九三变 · 风地观）。
```json
// 请求（originalQuestion/refinedQuestions 用于记录改写链路，可选）
{ "question": "…", "questionType": "relation", "originalQuestion": "…", "refinedQuestions": ["…"] }
// data
{ "id": "uuid", "question": "…", "hexagram": HexagramDTO, "changingLines": [3],
  "changingTo": HexagramDTO, "poem": "水落石出非一夕，山木成荫待几春。", "createdAt": 1783049578284 }
```

### POST /divination/interpret
象/译/行三层解读，回填到起卦记录（`interpreted=true`）。
```json
// 请求
{ "divinationId": "uuid" }
// data
{ "divinationId": "uuid", "hexName": "风山渐", "changingTo": "风地观",
  "reading": { "xiang": "…", "yi": "…", "xing": "…" },
  "reflectQuestion": "…", "summary": "…" }
```

### GET /divination/records?limit=10
当前用户最近问卦（倒序，limit 上限 50）。
```json
// data: 数组
[{ "id": "uuid", "originalQuestion": "…", "question": "…", "refinedQuestions": ["…"],
   "hexName": "风山渐", "hexPinyin": "Jiàn", "changingTo": "风地观",
   "poem": "…", "summary": "…", "interpreted": true, "createdAt": 1783049578284 }]
```

## 小易聊天

### POST /assistant/chat
`conversationId` 传 null 开新会话；mock 回复按用户消息数轮询 4 句温和文案。
```json
// 请求
{ "conversationId": null, "message": "今天有点提不起劲" }
// data
{ "conversationId": "uuid", "userMessageId": "uuid",
  "reply": { "id": "uuid", "role": "assistant", "content": "…", "createdAt": 1783049578284 } }
```

## 心境

### POST /mood-journals
```json
// 请求（mood ∈ 平静/疲惫/烦躁/低落/期待/紧绷；stress 0-10）
{ "mood": "疲惫", "stress": 6, "smallThing": "傍晚走路回家，风很轻。" }
// data
{ "id": "uuid", "mood": "疲惫", "stress": 6, "smallThing": "…", "createdAt": 1783049578284 }
```

### GET /mood-journals?page=1&size=50&days=7
分页列表（days 可选，只取最近 N 天）。
```json
// data
{ "records": [JournalDTO], "total": 12, "page": 1, "size": 50 }
```

## 姻缘

### POST /relationship/analyze
分析并持久化 `relationship_profile`（mock 固定：泽山咸 + 三段文案）。
```json
// 请求
{ "self":    { "name": "你",   "sign": "双鱼", "birth": "1992 · 春分 · 月在巨蟹" },
  "partner": { "name": "之珩", "sign": "天蝎", "birth": "1990 · 立冬 · 月在白羊" } }
// data
{ "id": "uuid", "relationHexagram": HexagramDTO,
  "analysis": { "attraction": "…", "care": "…", "communication": "…" },
  "closingLine": "…", "chart": { "self": {"venus":"巨蟹"}, "partner": {"mars":"狮子"} },
  "createdAt": 1783049578284 }
```

## 语音

### POST /voice/transcriptions/mock
mock 转写（不接真实 STT；真实路径 `/voice/transcriptions` 已预留）。
```json
// 请求（context ∈ ask/chat/journal，决定返回哪句 mock 文本）
{ "context": "journal", "durationSec": 12 }
// data
{ "id": "uuid", "context": "journal", "text": "今天开了一整天会，挺累的。…", "provider": "mock", "createdAt": 1783049578284 }
```

## 今日

### GET /today
今日历法（**真实天文计算**：月亮星座/元素/八相月相，今日一卦按日期轮换 64 卦，小注 llm 模式下由模型生成；全站按日缓存 `gxwy:today:{provider}:{date}`）+ 当前用户近 7 天情绪轨迹（同日多条取最晚一条）。
```json
// data
{ "date": "2026-07-03",
  "astroHeadline": "月在水瓶，风象当令。思绪偏活跃，宜说出来，也宜写下来。",
  "moonNote": "亏凸月，慢慢放下一些，留下重要的。",
  "moonSign": "水瓶", "moonElement": "风",
  "hexagram": HexagramDTO, "hexagramNote": "月渐渐盈满又开始亏了，…",
  "moodTrack": [{ "date": "2026-06-27", "label": "六", "mood": null, "stress": null },
                { "date": "2026-06-30", "label": "二", "mood": "烦躁", "stress": 6 }, "…共7项"],
  "moodSummary": "过去七天，你大多是「烦躁」的。偶尔的起伏，也都好好走过来了。" }
```

## 深度报告

### GET /reports/{id}
`{id}` = `latest`（当前月）或 `YYYY-MM`。按用户当月数据即时聚合（问卦次数/心境天数进 meta），不落表；非法 id 返回 `1001`。
```json
// data
{ "id": "2026-07", "title": "在「慢」与「稳」之间，你正在学的事",
  "meta": "基于 0 次问卦 · 0 天心境 · 本命星盘　·　7 月 3 日", "readMinutes": 6,
  "sections": [
    { "key": "astro",   "index": "01", "title": "星盘分析", "body": "…\n\n…", "items": null },
    { "key": "gua",     "index": "02", "title": "卦象分析", "body": "…\n\n(第二段渲染为引言框)", "items": null },
    { "key": "mood",    "index": "03", "title": "情绪主题", "body": "…", "items": null },
    { "key": "relation","index": "04", "title": "关系建议", "body": "…", "items": null },
    { "key": "action",  "index": "05", "title": "今日行动", "body": null, "items": ["…", "…", "…"] },
    { "key": "reflect", "index": "06", "title": "反思问题", "body": "…", "items": null }
  ],
  "disclaimer": "本报告由占星与周易的象征语言生成，用于自我整理与反思，不构成命运预测或医疗建议。" }
```
