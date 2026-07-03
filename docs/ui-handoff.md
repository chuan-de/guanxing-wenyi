# 观星问易 · 设计交接（UI Handoff）

设计源稿在 `design/`（design-code 格式，仅参考不参与构建）：

- `观星问易.dc.html` — 移动端设计源码（iPhone 390×844）
- `观星问易 Web.dc.html` — 桌面宽屏设计源码（落地页 + 工作台 7 页，自带响应式规范）
- `观星问易.html` / `support.js` — 可直接打开的打包预览版

## 1. 设计理念

**东方留白 × 西方星图 × 现代疗愈。** 宣纸底色上的星空卡片，衬线字标题 + 大量留白，动效缓慢克制（呼吸感）。

## 2. 设计 Token（已落地 `tailwind.config.ts`）

### 配色

| Token | 色值 | 用途 |
|---|---|---|
| `paper` | `#F3EFE7` | 月白 · 主背景 |
| `ink` | `#2B2A28` | 墨 · 主文字 |
| `stone` | `#938D82` | 星灰 · 辅助文字 |
| `night` | `#3C4A66` | 夜空青 · 主强调（按钮/选中态） |
| `gold` | `#B08E54` | 淡金 · 点缀（重点/引言） |
| `goldlite` | `#D8BE86` | 淡金亮 |
| `cloud` / `mist` / `sand` | `#EDE8DF` / `#E3DDD3` / `#D9D2C6` | 层次底色 |

深色卡片（星空）用 `.gx-night` 渐变类；常用透明度写法如 `rgba(43,42,40,0.06)`（墨色分隔线）、`rgba(60,74,102,0.1)`（夜空青边框）。

### 字体

| 族 | 字体 | 用途 |
|---|---|---|
| `font-serif` | Noto Serif SC | 标题、正文重点、卦名（古典感） |
| `font-sans` | Noto Sans SC | 界面文字 |
| `font-spectral` | Spectral（斜体） | 拉丁文/拼音/数字点缀 |

版式习惯：小标签用「字 间 空 格」+ `letterSpacing 3-5`；卦名 `letterSpacing 3-4`。

### 动效（前缀 `gx`）

`gxFade`（页面入场）、`gxRise`、`gxTwinkle`（星闪）、`gxDrift`/`gxFloat`（漂浮）、`gxBreathe`（小易呼吸）、`gxRing`（涟漪）、`gxShake`（摇签）、`gxWave`/`gxHalo`（录音波形/光晕）。节奏普遍偏慢（5-12s 循环），传达「不着急」。

## 3. 响应式规则（一套代码两端）

| 断点 | 布局 |
|---|---|
| ≥1024（lg） | 桌面三栏：左导航 236px + 主工作区 + 右上下文栏 |
| <1024 | 单栏堆叠 + 底部标签栏（前 5 个导航项，见 `lib/nav.ts` 的 `mobile` 标记） |

弹层（如语音 `VoiceSheet`）：移动端底部抽屉（圆角 26 顶部），桌面居中卡片（`sm:w-[420px]`）。

## 4. 关键组件（`components/`）

| 组件 | 说明 |
|---|---|
| `AppShell.tsx` | 工作台响应式外壳：桌面左导航 / 移动底部标签栏 |
| `primitives.tsx` | `HexLines`（卦爻线，**lines 数组由上到下**，`true`=阳爻整线 / `false`=阴爻断线，支持 `changing` 变爻高亮）、`XiaoyiOrb`（小易球，`breathe` 呼吸）、`Moon`（月相） |
| `ui.tsx` | `Card`（`strong` 加重投影）、`Label`（字间距小标签）、`ACCENT` 常量 |
| `VoiceSheet.tsx` | 语音输入三阶段弹层：录音中 → 转写中 → 结果确认（可编辑/重录/使用） |
| `RecentDivinations.tsx` | 最近问卦列表（接后端，带 empty state） |
| `icons.tsx` | 线性图标集（stroke 1.5-1.7，圆角端点） |

## 5. 文案基调

温和、克制、留白。禁止：命令式、恐吓式、绝对化断言。常用句式：「先……就好」「不必急着……」「慢慢……」。所有解读结尾落在用户自己身上（反思问题），而不是结论。
