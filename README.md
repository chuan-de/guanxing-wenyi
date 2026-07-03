# 观星问易 · GuanXing WenYi

一个东西方结合的情绪陪伴产品：西方占星(天象/月相) + 东方易经卦象 + AI 伙伴「小易」。
**一套 Next.js 代码，响应式同时覆盖移动端与桌面宽屏 Web。**

## 技术栈

- **Next.js 14**(App Router)+ **TypeScript**
- **Tailwind CSS**(设计 token：月白 / 墨 / 星灰 / 夜空青 / 淡金)
- 字体：Noto Serif SC（衬线·古典）、Noto Sans SC（无衬线·现代）、Spectral（拉丁斜体）

## 开发

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 生产构建
```

## 路由结构

| 路由 | 页面 |
|---|---|
| `/` | 落地页 Landing（Hero / 价值 / 今日 / 小易 / 流程 / 陪伴+姻缘 / 安全边界 / CTA） |
| `/app` | 今日工作台 Dashboard |
| `/app/ask` | 问卦（小易改写 + 按住起卦仪式 + 卦象解读） |
| `/app/chat` | 小易聊天（带回复逻辑） |
| `/app/journal` | 心境（情绪命名 + 紧绷程度 + 七天轨迹） |
| `/app/love` | 姻缘（双盘交叠 + 关系卦 + 三段分析） |
| `/app/report` | 深度报告（目录 + 长文 + 元信息） |
| `/app/system` | 设计系统 |

## 响应式

- **≥1024(lg)桌面**：左导航 236 + 主工作区 + 右上下文，三栏并列。
- **<1024 移动端**：单栏堆叠 + 底部标签栏导航，复用同一套设计语言与摇签交互。

## 目录

```
app/                 路由与页面
  layout.tsx         根布局（字体 / 全局样式）
  page.tsx           落地页
  app/               工作台路由组（含响应式外壳）
components/          AppShell、图标、基础组件(卦爻线/小易/月相)、UI
lib/                 数据(卦象/导航)与共享状态(store)
design/             原始设计稿(.dc.html / support.js)，仅作参考，不参与构建
```

## 说明

本产品是情绪陪伴工具，不提供命运预测或医疗诊断。卦象与星象是象征的语言，是镜子，不是答案。
