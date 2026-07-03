"use client";

import { useState } from "react";
import { Card, Label, ACCENT } from "@/components/ui";
import { XiaoyiOrb } from "@/components/primitives";
import { IconMic } from "@/components/icons";
import VoiceSheet from "@/components/VoiceSheet";
import { useAppState } from "@/lib/store";
import { relativeLabel } from "@/lib/storage";

const WEEK = ["一", "二", "三", "四", "五", "六", "日"];
const SEVEN = [
  { d: "一", h: 30, c: "#9FAAB4" },
  { d: "二", h: 46, c: "#C2A878" },
  { d: "三", h: 38, c: "#9FAAB4" },
  { d: "四", h: 26, c: "#A7B0A0" },
  { d: "五", h: 52, c: "#C29B86" },
  { d: "六", h: 34, c: "#9FAAB4" },
  { d: "日", h: 28, c: "#9FAAB4" },
];
const MOODS = ["平静", "疲惫", "烦躁", "低落", "期待", "紧绷"];
const SUMMARY = [
  ["当前情绪", "疲惫，但夜里有一丝松动"],
  ["压力来源", "一整天的会议，以及没顾上照顾自己"],
  ["身体感受", "头有点胀，肩膀紧绷"],
  ["反思问题", "如果今晚只照顾自己一件事，会是什么？"],
];
const HISTORY = [
  { d: "三月十五 · 期待", s: "紧绷 4/10", c: "#C2A878" },
  { d: "三月十四 · 平静", s: "紧绷 3/10", c: "#9FAAB4" },
  { d: "三月十二 · 低落", s: "紧绷 7/10", c: "#C29B86" },
];

// 情绪 → 轨迹点颜色
const MOOD_COLOR: Record<string, string> = {
  平静: "#9FAAB4",
  疲惫: "#C2A878",
  烦躁: "#C29B86",
  低落: "#C29B86",
  期待: "#C2A878",
  紧绷: "#C29B86",
};

// 三月日历(简化)：14-20 有记录点
const CAL: { day: number; muted?: boolean; dot?: string; today?: boolean }[] = [
  { day: 23, muted: true }, { day: 24, muted: true }, { day: 25, muted: true }, { day: 26, muted: true },
  { day: 14, dot: "#9FAAB4" }, { day: 15, dot: "#C2A878" }, { day: 16 },
  { day: 17, dot: "#9FAAB4" }, { day: 18 }, { day: 19, dot: "#C29B86" }, { day: 20, today: true }, { day: 21, muted: true }, { day: 22, muted: true }, { day: 23, muted: true },
];

export default function JournalPage() {
  const { mood, setMood, stress, setStress, smallThing, setSmallThing, saveJournal, journals } =
    useAppState();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    saveJournal();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <div className="animate-gxFade" style={{ maxWidth: 1340, margin: "0 auto" }}>
      <div className="mb-6">
        <div className="font-serif" style={{ fontSize: "clamp(24px,2.8vw,30px)", color: "#2B2A28", fontWeight: 500 }}>心境</div>
        <div style={{ fontSize: 13, color: "#928C81", marginTop: 8 }}>三月二十 · 周四 · 把今天，轻轻收好。</div>
      </div>

      <div className="flex flex-wrap items-start gap-[22px]">
        {/* LEFT 日历 + 七天 */}
        <div className="flex flex-col gap-[18px]" style={{ flex: "1 1 270px", minWidth: 260, maxWidth: 340 }}>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <div className="mb-4 flex items-center justify-between"><span className="font-serif" style={{ fontSize: 15, color: "#2B2A28" }}>三月</span><span style={{ fontSize: 12, color: "#A39C8F" }}>2026</span></div>
            <div className="mb-2 grid grid-cols-7 gap-1.5 text-center" style={{ fontSize: 10, color: "#A39C8F" }}>{WEEK.map((w) => <span key={w}>{w}</span>)}</div>
            <div className="grid grid-cols-7 gap-1.5">
              {CAL.map((c, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-[2px]" style={{ aspectRatio: "1", fontSize: 12, color: c.today ? "#F3EFE7" : c.muted ? "#C2BBAE" : "#54514A", background: c.today ? "#3C4A66" : "transparent", borderRadius: c.today ? "50%" : 0, fontWeight: c.today ? 500 : 400 }}>
                  {c.day}
                  {c.dot && <span style={{ width: 4, height: 4, borderRadius: "50%", background: c.dot }} />}
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-5">过 去 七 天</Label>
            <div className="flex items-end justify-between" style={{ height: 70 }}>
              {SEVEN.map((b) => (
                <div key={b.d} className="flex flex-1 flex-col items-center gap-[7px]"><div style={{ width: 8, height: b.h, borderRadius: 5, background: b.c }} /><span style={{ fontSize: 9, color: "#A39C8F" }}>{b.d}</span></div>
              ))}
            </div>
          </Card>
        </div>

        {/* CENTER 今日记录 */}
        <div className="flex flex-col gap-[18px]" style={{ flex: "2 1 420px", minWidth: 320 }}>
          <button onClick={() => setVoiceOpen(true)} className="text-left" style={{ borderRadius: 20, padding: "20px 22px", background: "linear-gradient(165deg, rgba(60,74,102,0.07), rgba(176,142,84,0.05))", border: "1px solid rgba(60,74,102,0.13)", display: "flex", alignItems: "center", gap: 15, width: "100%", cursor: "pointer" }}>
            <div style={{ width: 44, height: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#3C4A66" }}><IconMic style={{ width: 20, height: 20 }} /></div>
            <div className="flex-1"><div className="font-serif" style={{ fontSize: 15.5, color: "#2B2A28" }}>用一段话，说说今天</div><div style={{ fontSize: 12, color: "#928C81", marginTop: 5 }}>说完，小易帮你把这一刻，轻轻收好。</div></div>
            <span style={{ color: "#B0A99D" }}>›</span>
          </button>

          <Card style={{ borderRadius: 20, padding: 24 }}>
            <div className="font-serif" style={{ fontSize: 16, color: "#2B2A28" }}>此刻，你的心情更接近——</div>
            <div className="mt-[18px] grid gap-[10px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))" }}>
              {MOODS.map((m) => {
                const active = m === mood;
                return (
                  <button key={m} onClick={() => setMood(m)} className="text-center" style={{ padding: "11px 0", borderRadius: 12, border: active ? `1px solid ${ACCENT}` : "1px solid rgba(43,42,40,0.13)", background: active ? "rgba(60,74,102,0.06)" : "transparent", fontSize: 13.5, color: active ? "#2B2A28" : "#857F74" }}>{m}</button>
                );
              })}
            </div>
            <div className="mt-[26px] flex items-baseline justify-between"><span style={{ fontSize: 10, letterSpacing: 3, color: "#A39C8F" }}>今 天 的 紧 绷 程 度</span><span className="font-spectral" style={{ fontSize: 20, color: ACCENT }}>{stress}<span style={{ fontSize: 11, color: "#A39C8F" }}> / 10</span></span></div>
            <input type="range" min={0} max={10} value={stress} onChange={(e) => setStress(Number(e.target.value))} style={{ width: "100%", marginTop: 14 }} />
            <div className="mt-3 flex justify-between" style={{ fontSize: 11, color: "#A39C8F" }}><span>松弛</span><span>紧绷</span></div>
          </Card>

          <Card style={{ borderRadius: 20, padding: 24 }}>
            <Label className="mb-2">今 天 的 一 件 小 事</Label>
            <div className="font-serif" style={{ fontSize: 16, color: "#2B2A28", lineHeight: 1.7 }}>今天，有没有哪个瞬间，让你松了一口气？</div>
            <textarea
              value={smallThing}
              onChange={(e) => setSmallThing(e.target.value)}
              placeholder="写下来，哪怕只有一句。"
              className="font-serif"
              style={{ width: "100%", marginTop: 15, minHeight: 90, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: 15, lineHeight: 1.9, color: "#2B2A28", caretColor: "#3C4A66" }}
            />
            <div className="flex items-center justify-between" style={{ marginTop: 8, paddingTop: 14, borderTop: "1px solid rgba(43,42,40,0.06)" }}>
              <span style={{ fontSize: 11.5, color: saved ? "#7C9A7E" : "#A39C8F", transition: "color .3s" }}>
                {saved ? "✓ 今天的心境，已经收好了" : `此刻 · ${mood} · 紧绷 ${stress}/10`}
              </span>
              <button onClick={onSave} className="rounded-xl" style={{ padding: "11px 22px", border: "none", background: ACCENT, color: "#F3EFE7", fontSize: 13.5, letterSpacing: 1 }}>保存今天的心境</button>
            </div>
          </Card>
        </div>

        {/* RIGHT 小易整理 + 历史 */}
        <div className="flex flex-col gap-[18px]" style={{ flex: "1 1 260px", minWidth: 250, maxWidth: 340 }}>
          <div className="gx-card-strong" style={{ borderRadius: 20, padding: 22, border: "1px solid rgba(60,74,102,0.14)" }}>
            <div className="mb-4 flex items-center gap-[9px]"><XiaoyiOrb size={26} /><span style={{ fontSize: 10, letterSpacing: 3, color: "#A39C8F" }}>小 易 · 语 音 整 理</span></div>
            <div className="flex flex-col gap-[14px]">
              {SUMMARY.map(([k, v], i) => (
                <div key={i} className="flex gap-3"><div style={{ width: 64, flexShrink: 0, fontSize: 11.5, color: "#8A93A2", paddingTop: 1 }}>{k}</div><div className={i === 3 ? "font-serif" : ""} style={{ flex: 1, fontSize: 13.5, lineHeight: 1.7, color: i === 3 ? "#3A4255" : "#46433C" }}>{v}</div></div>
              ))}
            </div>
          </div>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-1.5">历 史 记 录</Label>
            {(() => {
              const persisted = journals.map((j) => ({
                d: `${relativeLabel(j.createdAt)} · ${j.mood}`,
                s: j.smallThing ? j.smallThing : `紧绷 ${j.stress}/10`,
                c: MOOD_COLOR[j.mood] ?? "#9FAAB4",
              }));
              const rows = [...persisted, ...HISTORY].slice(0, 6);
              return rows.map((h, i) => (
                <div key={i} className="flex items-center gap-3" style={{ padding: "13px 0", borderBottom: i < rows.length - 1 ? "1px solid rgba(43,42,40,0.06)" : "none" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: h.c, flexShrink: 0, marginTop: 1 }} />
                  <div className="flex-1 min-w-0"><div style={{ fontSize: 13, color: "#46433C" }}>{h.d}</div><div style={{ fontSize: 11, color: "#A39C8F", marginTop: 3, lineHeight: 1.6 }}>{h.s}</div></div>
                </div>
              ));
            })()}
          </Card>
        </div>
      </div>

      <VoiceSheet open={voiceOpen} context="journal" onClose={() => setVoiceOpen(false)} onUse={(t) => setSmallThing(t)} />
    </div>
  );
}
