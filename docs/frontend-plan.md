# 观星问易 · 前端架构

> 注：早期草案曾考虑 Vite，实际落地为 **Next.js 14（App Router）+ TypeScript + Tailwind CSS**，本文以实际代码为准。

## 1. 技术选型

- **Next.js 14 App Router**：落地页静态化 + 工作台 SPA 体验；一套响应式代码同时覆盖移动端与桌面宽屏（断点规则见 `docs/ui-handoff.md`）。
- **TypeScript** 严格模式；**Tailwind** 承载设计 token，页面细节样式允许内联 style（与设计稿逐像素对齐的部分）。
- 无额外状态库：共享状态用 React Context（`lib/store.tsx`）。

## 2. 目录结构

```
app/
  layout.tsx        根布局（字体变量 / 全局样式）
  page.tsx          落地页 /
  app/              工作台路由组
    layout.tsx      挂 AppShell + StoreProvider
    page.tsx        /app        今日（client，接 /today + /divination/records）
    ask/page.tsx    /app/ask    问卦（接 refine/cast/interpret/records）
    chat/page.tsx   /app/chat   小易聊天（接 /assistant/chat）
    journal/page.tsx /app/journal 心境（接 /mood-journals）
    love/page.tsx   /app/love   姻缘（client，接 /relationship/analyze）
    report/page.tsx /app/report 深度报告（client，接 /reports/latest）
    system/page.tsx /app/system 设计系统（纯静态）
components/         AppShell / primitives / ui / VoiceSheet / RecentDivinations / icons
lib/
  api.ts            统一 API client（见下）
  store.tsx         React Context：问卦流程 / 聊天 / 心境的共享状态与动作
  storage.ts        localStorage 封装（gxwy.divinations / gxwy.journals，作后端不可用时的本地留存）
  hexagrams.ts      卦象常量（爻线由上到下，true=阳/false=阴）
  nav.ts            导航配置（mobile 标记决定底部标签栏）
```

## 3. 数据流与后端对接约定

### `lib/api.ts` 统一 client

- base = `NEXT_PUBLIC_API_BASE_URL`（默认 `http://localhost:8080`）+ `/api`
- 自动带 `X-User-Id` 头（localStorage `gxwy.userId`，缺省 `demo-user`；SSR 时 `anonymous`）
- 解包后端统一信封 `{code, message, data}`，`code!=0` 抛 `ApiError`
- 8s 超时（`AbortSignal.timeout`）

### 「真实接口 + 静态回退」模式（全站统一）

每个接后端的页面/动作都遵循同一模式：

```tsx
useEffect(() => {
  let alive = true;
  api.getXxx()
    .then((d) => { if (alive) setResp(d); })
    .catch(() => { /* 后端不可用：保留本地静态/mock 内容 */ });
  return () => { alive = false; };
}, []);
const value = resp?.field ?? FALLBACK;
```

- 回退内容与后端 mock 文案**保持一致**，因此后端在/不在视觉无差异。
- 失败静默处理，不弹错误（陪伴产品不吓用户）；`alive` 标记避免卸载后 setState。
- dev 模式 React StrictMode 会让 `useEffect` 执行两次（重复请求），是预期行为，生产无此现象，不要「修」。

### 页面 × 接口对照

| 页面 | 接口 | 回退 |
|---|---|---|
| 今日 | `GET /today`、`GET /divination/records` | 静态星象/屯卦文案、示意柱状图 |
| 问卦 | `POST refine-question / cast / interpret`、`GET records` | 本地 organizeQuestions / 写死渐→观卦文案 / localStorage |
| 小易 | `POST /assistant/chat` | 本地 REPLIES 轮询 |
| 心境 | `POST+GET /mood-journals` | localStorage |
| 姻缘 | `POST /relationship/analyze` | 写死咸卦三段分析 |
| 报告 | `GET /reports/latest` | 写死六段长文 |
| 语音弹层 | `POST /voice/transcriptions/mock` | 本地 MOCK_TRANSCRIPT 三句 |

## 4. 重要约束

- **dev server 必须跑在 3000 端口**：后端 CORS 只允许 `http://localhost:3000`。端口被占时 Next 会退到 3001，请求会被 CORS 拦截并静默回退 mock——看起来像「接口没通」，实际是端口问题。
- 卦爻线数组**由上到下**，前后端一致（`HexLines` 直接渲染 `HexagramDTO.lines`）。
- 不引入复杂状态管理、不做过度抽象；新页面接后端照抄上面的统一模式即可。
