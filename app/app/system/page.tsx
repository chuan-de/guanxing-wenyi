import { Card } from "@/components/ui";
import { HexLines, XiaoyiOrb } from "@/components/primitives";

const COLORS = [
  { c: "#F3EFE7", name: "月白", code: "#F3EFE7 · 主背景", border: true },
  { c: "#2B2A28", name: "墨", code: "#2B2A28 · 主文字" },
  { c: "#938D82", name: "星灰", code: "#938D82 · 辅助" },
  { c: "#3C4A66", name: "夜空青", code: "#3C4A66 · 主强调" },
  { c: "#B08E54", name: "淡金", code: "#B08E54 · 点缀" },
  { c: "linear-gradient(157deg,#28324B,#181D2C)", name: "夜空", code: "沉浸场景" },
];

const RESP = [
  { label: "≥ 1440　桌面", d: "左导航 + 主区 + 右上下文，三栏并列。沉浸式星图与大留白。" },
  { label: "1024　平板", d: "右上下文面板下移为主区下方区块；导航可收起为图标。三栏 flex-wrap 自然折叠。" },
  { label: "< 768　移动端", d: "单栏堆叠，底部标签栏导航。复用 390×844 移动端设计语言与摇签、语音交互。" },
];

const SectionLabel = ({ children, mt = 8 }: { children: React.ReactNode; mt?: number }) => (
  <div style={{ fontSize: 10, letterSpacing: 4, color: "#A39C8F", margin: `${mt}px 2px 16px` }}>{children}</div>
);

export default function SystemPage() {
  return (
    <div className="animate-gxFade" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <div className="mb-[30px]">
        <div className="font-serif" style={{ fontSize: "clamp(24px,2.8vw,30px)", color: "#2B2A28", fontWeight: 500 }}>设计系统 · 网页端</div>
        <div style={{ fontSize: 13, color: "#928C81", marginTop: 8 }}>安静 · 克制 · 可信赖　—　东方留白 × 西方星图 × 现代疗愈</div>
      </div>

      {/* 颜色 */}
      <SectionLabel>颜 色</SectionLabel>
      <div className="mb-10 grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
        {COLORS.map((c) => (
          <div key={c.name}>
            <div style={{ height: 62, borderRadius: 12, background: c.c, border: c.border ? "1px solid rgba(43,42,40,0.1)" : "none" }} />
            <div style={{ fontSize: 12.5, color: "#46433C", marginTop: 9 }}>{c.name}</div>
            <div className="font-spectral" style={{ fontSize: 11, color: "#A39C8F" }}>{c.code}</div>
          </div>
        ))}
      </div>

      {/* 字体 */}
      <SectionLabel>字 体 · 双 声 部</SectionLabel>
      <div className="mb-10 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        <Card style={{ padding: 24, borderRadius: 16 }}>
          <div className="font-serif" style={{ fontSize: 26, color: "#2B2A28" }}>山泽损 · 月在巨蟹</div>
          <div style={{ fontSize: 11.5, color: "#928C81", marginTop: 12, lineHeight: 1.7 }}>衬线 · 古典之声　Noto Serif SC / Spectral<br />卦辞、星象、标题与诗性的句子。</div>
        </Card>
        <Card style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ fontSize: 20, color: "#2B2A28", fontWeight: 500 }}>今天，先做一件小事。</div>
          <div style={{ fontSize: 11.5, color: "#928C81", marginTop: 12, lineHeight: 1.7 }}>无衬线 · 现代之声　Noto Sans SC<br />正文、界面、情绪命名与行动建议。</div>
        </Card>
      </div>

      {/* 桌面布局 */}
      <SectionLabel>桌 面 布 局 · 1440 / 12 栅 格</SectionLabel>
      <Card className="mb-[18px]" style={{ padding: 26, borderRadius: 18 }}>
        <div className="mb-5 grid grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ height: 40, background: i === 0 ? "rgba(60,74,102,0.1)" : i === 11 ? "rgba(176,142,84,0.12)" : "rgba(60,74,102,0.06)", borderRadius: 4 }} />
          ))}
        </div>
        <div className="flex gap-[10px]" style={{ height: 90 }}>
          <div className="flex items-center justify-center text-center" style={{ width: 64, background: "rgba(60,74,102,0.1)", borderRadius: 8, fontSize: 10, color: "#3C4A66", lineHeight: 1.4 }}>左导航<br />236</div>
          <div className="flex flex-1 items-center justify-center" style={{ background: "rgba(60,74,102,0.05)", borderRadius: 8, fontSize: 11, color: "#7C766B" }}>主工作区　·　max 720 阅读栏</div>
          <div className="flex items-center justify-center text-center" style={{ width: 120, background: "rgba(176,142,84,0.08)", borderRadius: 8, fontSize: 10, color: "#8A7B57", lineHeight: 1.4 }}>右上下文<br />280–320</div>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.95, color: "#6B665D", marginTop: 18 }}>桌面优先 1440px，12 栅格，列间距 24px，外边距 clamp(24, 5vw, 72)。工作台采用「左导航 + 主工作区 + 右上下文面板」；落地页与报告页采用通栏阅读，正文阅读栏宽度上限 720px。</div>
      </Card>

      {/* 组件 */}
      <SectionLabel mt={30}>组 件 规 范</SectionLabel>
      <div className="mb-10 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        <Card style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ fontSize: 13, color: "#2B2A28", fontWeight: 500, marginBottom: 14 }}>按钮</div>
          <div className="flex flex-col gap-[10px]">
            <div className="text-center" style={{ padding: 11, borderRadius: 12, background: "#3C4A66", color: "#F3EFE7", fontSize: 13 }}>主操作</div>
            <div className="text-center" style={{ padding: 11, borderRadius: 12, border: "1px solid rgba(60,74,102,0.22)", color: "#3C4A66", fontSize: 13 }}>次操作</div>
          </div>
        </Card>
        <Card style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ fontSize: 13, color: "#2B2A28", fontWeight: 500, marginBottom: 14 }}>卡片</div>
          <div style={{ fontSize: 11.5, lineHeight: 1.8, color: "#6B665D" }}>圆角 18–24，背景 rgba(255,255,255,.5)，描边 rgba(43,42,40,.07)，柔光阴影。避免堆叠，给留白。</div>
        </Card>
        <Card style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ fontSize: 13, color: "#2B2A28", fontWeight: 500, marginBottom: 14 }}>卦爻线</div>
          <HexLines lines={[true, false, true]} changing={[2]} width={60} />
        </Card>
        <Card style={{ padding: 22, borderRadius: 16 }}>
          <div style={{ fontSize: 13, color: "#2B2A28", fontWeight: 500, marginBottom: 14 }}>小易</div>
          <div className="flex items-center gap-3"><XiaoyiOrb size={34} /><span style={{ fontSize: 11.5, color: "#6B665D", lineHeight: 1.6 }}>月白→夜空青球体<br />+ 一点淡金</span></div>
        </Card>
      </div>

      {/* 响应式 */}
      <SectionLabel>响 应 式 规 则</SectionLabel>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        {RESP.map((r) => (
          <Card key={r.label} style={{ padding: 22, borderRadius: 16 }}>
            <div style={{ fontSize: 13, color: "#2B2A28", fontWeight: 500 }}>{r.label}</div>
            <div style={{ fontSize: 12, lineHeight: 1.85, color: "#6B665D", marginTop: 8 }}>{r.d}</div>
          </Card>
        ))}
      </div>

      {/* 语气 */}
      <div className="mt-10" style={{ padding: 24, borderRadius: 18, background: "rgba(60,74,102,0.045)", border: "1px solid rgba(60,74,102,0.1)" }}>
        <div style={{ fontSize: 12, color: "#3C4A66", fontWeight: 500, marginBottom: 14 }}>语气</div>
        <div className="flex flex-wrap gap-6">
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: "#7C9A7E", marginBottom: 10 }}>会说</div>
            <div className="flex flex-col gap-2" style={{ fontSize: 13, color: "#54514A", lineHeight: 1.5 }}><div>适合观察</div><div>可以先整理边界</div><div>今天先做一件小事</div></div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: "#B0A99D", marginBottom: 10 }}>不说</div>
            <div className="flex flex-col gap-2" style={{ fontSize: 13, color: "#B0A99D", lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(176,142,84,0.5)" }}><div>必然 · 注定</div><div>大凶 · 血光之灾</div><div>必定复合 · 必定发财</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
