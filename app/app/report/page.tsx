"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@/components/icons";
import { api, type ReportResp, type ReportSectionDTO } from "@/lib/api";

// 后端不可用时的静态回退（与 GET /api/reports/latest 的 mock 正文一致）
const FALLBACK_REPORT: ReportResp = {
  id: "2026-03",
  title: "在「慢」与「稳」之间，你正在学的事",
  meta: "基于 2 次问卦 · 7 天心境 · 本命星盘　·　三月二十",
  readMinutes: 6,
  sections: [
    {
      key: "astro", index: "01", title: "星盘分析", items: null,
      body: "这段时间，月亮多次行经你的巨蟹宫——情绪会比平时更需要被照顾。你可能会发现，自己更容易被一些细小的事触动，也更想退回到熟悉、安全的地方。这不是脆弱，而是你天然的节律。\n\n与此同时，你的上升天秤提醒你：在照顾别人和照顾自己之间，可以慢慢找回一点平衡。先把自己的感受，放回桌面上来。",
    },
    {
      key: "gua", index: "02", title: "卦象分析", items: null,
      body: "两次问卦，都落在「渐」的主题上：循序渐进。鸿雁依次而飞，山上的树慢慢生长。它一再提醒的，不是「快或慢」，而是「按自己的次序来」。九三爻动，变为「观」——是时候先观察，而不是用力推进。\n\n这一卦不是替你决定，而是帮你看见当下的重心：现在适合扎根，不必急着开花。",
    },
    {
      key: "mood", index: "03", title: "情绪主题", items: null,
      body: "过去七天，你大多是「平静」的，偶尔疲惫。紧绷的峰值出现在周五——那天的会议和未被照顾的午餐，是身体先替你说出了累。整体看，你比自己以为的，走得更稳。这一周的情绪关键词，是「想被理解」。",
    },
    {
      key: "relation", index: "04", title: "关系建议", items: null,
      body: "你与之珩之间，有一种不必勉强的呼应；需要照顾的，是两种不同的呼吸节奏。当你想靠近、而对方想喘口气时，试着把需要说出来，而不是猜。这不是谁对谁错，只是练习：在亲密与独立之间，各自找到位置。",
    },
    {
      key: "action", index: "05", title: "今日行动", body: null,
      items: [
        "今晚给自己十分钟，什么都不做，只是坐着。",
        "和之珩说一句「我现在有点需要你」。",
        "把那条拖了三天的消息，写下第一句话就好。",
      ],
    },
    {
      key: "reflect", index: "06", title: "反思问题", items: null,
      body: "如果不必现在就给出答案，\n你最想先为自己守住的，是什么？",
    },
  ],
  disclaimer: "本报告由占星与周易的象征语言生成，用于自我整理与反思，不构成命运预测或医疗建议。",
};

const MONTH_CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

function periodTag(id: string) {
  const m = /^\d{4}-(\d{2})$/.exec(id);
  const month = m ? MONTH_CN[Number(m[1]) - 1] : "三";
  return `${month} 月 · 深 度 报 告`;
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-[18px] flex items-center gap-[11px]">
        <span className="font-spectral" style={{ fontSize: 18, color: "#C9B89A" }}>{n}</span>
        <h2 className="font-serif" style={{ fontWeight: 500, fontSize: 22, color: "#2B2A28", margin: 0, letterSpacing: 1 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

const P: React.CSSProperties = { fontWeight: 300, fontSize: 16, lineHeight: 2.1, color: "#46433C", margin: 0 };

// 每段按 key 保留原有版式：gua 第二段是金色引言框，reflect 是居中问句框，action 是清单
function SectionBody({ s }: { s: ReportSectionDTO }) {
  if (s.key === "action") {
    return (
      <div className="flex flex-col gap-[13px]">
        {(s.items ?? []).map((a, i) => (
          <div key={i} className="flex items-start gap-[13px]">
            <IconCheck style={{ flexShrink: 0, marginTop: 2, color: "#3C4A66" }} />
            <span style={{ fontSize: 15, lineHeight: 1.8, color: "#46433C" }}>{a}</span>
          </div>
        ))}
      </div>
    );
  }
  if (s.key === "reflect") {
    return (
      <div className="text-center" style={{ padding: 28, borderRadius: 18, background: "rgba(60,74,102,0.05)", border: "1px solid rgba(60,74,102,0.1)" }}>
        <div className="font-serif" style={{ fontSize: 19, lineHeight: 1.9, color: "#3A4255", whiteSpace: "pre-line" }}>{s.body}</div>
      </div>
    );
  }
  const paras = (s.body ?? "").split("\n\n");
  if (s.key === "gua") {
    return (
      <>
        <p style={{ ...P, marginBottom: 22 }}>{paras[0]}</p>
        {paras[1] && (
          <div style={{ padding: "24px 28px", borderLeft: "2px solid rgba(176,142,84,0.5)", background: "rgba(176,142,84,0.04)", borderRadius: "0 12px 12px 0" }}>
            <div className="font-serif" style={{ fontSize: 18, lineHeight: 1.9, color: "#3A4255" }}>{paras[1]}</div>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} style={{ ...P, marginBottom: i < paras.length - 1 ? 18 : 0 }}>{p}</p>
      ))}
    </>
  );
}

export default function ReportPage() {
  const [resp, setResp] = useState<ReportResp | null>(null);
  const report = resp ?? FALLBACK_REPORT;
  const [sec, setSec] = useState(report.sections[0]?.key ?? "astro");

  useEffect(() => {
    let alive = true;
    api
      .getReport("latest")
      .then((d) => { if (alive) setResp(d); })
      .catch(() => { /* 后端不可用：保留静态回退内容 */ });
    return () => { alive = false; };
  }, []);

  return (
    <div className="animate-gxFade" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div className="flex flex-wrap items-start" style={{ gap: "clamp(24px,4vw,56px)" }}>
        {/* LEFT TOC */}
        <aside className="hidden lg:block" style={{ flex: "0 1 190px", minWidth: 170, position: "sticky", top: 0, alignSelf: "flex-start" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#A39C8F", marginBottom: 18 }}>目 录</div>
          <div className="flex flex-col gap-[3px]">
            {report.sections.map((t) => {
              const active = sec === t.key;
              return (
                <button key={t.key} onClick={() => setSec(t.key)} className="relative rounded-[9px] text-left transition-colors hover:bg-night/[0.04]" style={{ padding: "9px 12px" }}>
                  {active && <span className="absolute left-0 top-[22%] bottom-[22%] w-[2.5px] rounded-[3px] bg-night" />}
                  <span style={{ fontSize: 13.5, color: active ? "#2B2A28" : "#54514A", letterSpacing: 0.5 }}>{t.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER ARTICLE */}
        <article style={{ flex: "1 1 520px", minWidth: 320, maxWidth: 720 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: "#B08E54", marginBottom: 18 }}>{periodTag(report.id)}</div>
          <h1 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(28px,3.4vw,40px)", lineHeight: 1.45, color: "#2B2A28", margin: 0, letterSpacing: 1 }}>{report.title}</h1>
          <div style={{ fontSize: 12.5, color: "#928C81", marginTop: 20, letterSpacing: 0.5 }}>{report.meta}</div>
          <div style={{ height: 1, background: "rgba(43,42,40,0.1)", margin: "32px 0" }} />

          <div className="flex flex-col" style={{ gap: 44 }}>
            {report.sections.map((s) => (
              <Section key={s.key} n={s.index} title={s.title}>
                <SectionBody s={s} />
              </Section>
            ))}
          </div>

          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(43,42,40,0.1)", fontSize: 12.5, lineHeight: 1.9, color: "#A39C8F" }}>{report.disclaimer}</div>
        </article>

        {/* RIGHT META */}
        <aside className="hidden xl:flex flex-col gap-4" style={{ flex: "0 1 210px", minWidth: 190, position: "sticky", top: 0, alignSelf: "flex-start" }}>
          <div className="gx-card" style={{ borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#A39C8F", marginBottom: 14 }}>阅 读 进 度</div>
            <div style={{ height: 4, borderRadius: 4, background: "rgba(43,42,40,0.08)", overflow: "hidden" }}><div style={{ height: "100%", width: "34%", background: "linear-gradient(90deg,#93A1AE,#C9B89A)", borderRadius: 4 }} /></div>
            <div style={{ fontSize: 11.5, color: "#928C81", marginTop: 10 }}>约 {report.readMinutes} 分钟读完</div>
          </div>
          <div className="gx-card flex flex-col gap-1" style={{ borderRadius: 18, padding: 14 }}>
            {["导出 PDF", "保存到我的", "分享"].map((t) => (
              <button key={t} className="flex items-center gap-[11px] rounded-[11px] text-left transition-colors hover:bg-night/[0.05]" style={{ padding: "11px 12px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3C4A66" }} />
                <span style={{ fontSize: 13, color: "#46433C" }}>{t}</span>
              </button>
            ))}
          </div>
          <div style={{ borderRadius: 18, padding: "18px 20px", background: "rgba(60,74,102,0.045)", border: "1px solid rgba(60,74,102,0.1)" }}>
            <div style={{ fontSize: 12, lineHeight: 1.9, color: "#6B665D" }}>报告只是一面镜子。读它的时候，留意哪一句让你心里轻轻一动——那往往，就是此刻的重心。</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
