# CLAUDE.md

观星问易 —— 东西方结合的情绪陪伴产品（占星 + 易经 + AI 伙伴「小易」）。
前端 Next.js 14 + TS + Tailwind（仓库根），后端 Spring Boot 3 + PostgreSQL + Redis（`backend/`）。

## 常用命令

```bash
# 前端（仓库根）
npm run dev        # http://localhost:3000 —— 必须是 3000，见下方 CORS 约束
npm run build      # 生产构建（提交前必跑）

# 后端
cd backend && mvn clean package        # 构建 + 单测（离线可过，不需要 DB）
docker compose up -d                   # 起 PostgreSQL(gxwy-postgres) + Redis(gxwy-redis)
java -jar backend/target/guanxing-wenyi-backend.jar   # http://localhost:8080，Swagger: /swagger-ui.html
```

DB 连接：用户 `gxwy` / 库 `guanxing_wenyi`（不是 postgres/postgres），见 `.env.example`。
`docker exec gxwy-postgres psql -U gxwy -d guanxing_wenyi -c "..."`

## 架构要点

- **文档**：产品 `docs/product.md`；设计 token/组件 `docs/ui-handoff.md`；前端架构与对接模式 `docs/frontend-plan.md`；接口契约 `docs/api-draft.md`；后端设计 `docs/backend-plan.md`。
- **前端对接后端的统一模式**：`lib/api.ts` 统一 client（`X-User-Id` 头、信封解包、8s 超时）；页面 client component 在 `useEffect` 里调接口（`alive` 标记防卸载后 setState），**失败静默回退本地静态/mock 内容**——回退文案与后端 mock 保持一致，接口在/不在视觉无差异。新页面接后端照抄此模式。
- **后端**：统一返回 `ApiResponse{code,message,data}`；`X-User-Id` 拦截器 + `UserContext`(ThreadLocal)；每次 AI 调用写 `ai_request_log`（真实调用失败也落 `status=failed` 行）。DTO 用 record（不用 Lombok，JDK25 下注解处理器不稳）；id=UUID 字符串、createdAt=epoch 毫秒。
- **AI 两层抽象**：业务层 `AiService`（mock=`MockAiService` / llm=`LlmAiService`，由 `GXWY_AI_PROVIDER` 选）；模型层 `AiClient`（`service/ai/client/`，chat + structuredJson 两种调法，厂商由 `GXWY_AI_CLIENT` 选：doubao 已接 / deepseek 预留，均走 OpenAI 兼容协议 `OpenAiCompatClient`）。**业务代码只准依赖 `AiService`，`LlmAiService` 只准依赖 `AiClient`——厂商名不得出现在 client 包之外**。API key 只从环境变量读（`DOUBAO_API_KEY`/`DEEPSEEK_API_KEY`，见 `.env.example`），绝不提交。真实调用失败一律回退 mock 结果，接口对外永不报错。当前只有 refine-question 走真实模型，其余能力在 `LlmAiService` 里委托 mock，逐个迁移。
- **Flyway**：迁移在 `backend/src/main/resources/db/migration/`，**不改已发布的旧 migration**，新变更加新版本号。

## 关键约束与坑

- **CORS 只允许 localhost:3000**：3000 被占用时 Next 退到 3001，请求被 CORS 拦截并静默回退 mock，看起来像「没接上」。先查端口。
- **卦爻线数组由上到下**，true=阳爻；前后端约定一致，别反转。
- dev 模式 React StrictMode 会让 `useEffect` 双触发（重复请求/重复落库），是预期行为，不要修。
- 文案基调温和克制（不预测命运/不制造恐惧/不诱导依赖/不做医疗诊断），改文案时遵守 `docs/product.md` 第 2 节。
- 不引入额外状态库/复杂抽象；当前阶段不接真实 AI、真实语音、鉴权、支付、微服务。
- `design/` 是原始设计稿，仅参考，不参与构建、不要改。
- curl 测中文 JSON 时用 `--data-binary @file`（UTF-8 文件），Git Bash 内联中文会出现编码错误（假 5000 报错）。
