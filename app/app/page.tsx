"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Label, ACCENT } from "@/components/ui";
import { HexLines, Moon, XiaoyiOrb } from "@/components/primitives";
import RecentDivinations from "@/components/RecentDivinations";
import { HEXAGRAMS } from "@/lib/hexagrams";
import { api, type TodayResp } from "@/lib/api";

// 后端不可用时的静态回退（与 GET /api/today 的 mock 内容一致）
const FALLBACK_MOOD_TRACK = [
  { d: "一", h: 34, c: "#9FAAB4" },
  { d: "二", h: 54, c: "#C2A878" },
  { d: "三", h: 44, c: "#9FAAB4" },
  { d: "四", h: 30, c: "#A7B0A0" },
  { d: "五", h: 62, c: "#C29B86" },
  { d: "六", h: 40, c: "#9FAAB4" },
  { d: "日", h: 32, c: "#9FAAB4" },
];

const MOOD_COLORS: Record<string, string> = {
  平静: "#9FAAB4",
  疲惫: "#C29B86",
  烦躁: "#BF8A6B",
  低落: "#8E99A8",
  期待: "#C2A878",
  紧绷: "#A98F63",
};

export default function DashboardPage() {
  const [today, setToday] = useState<TodayResp | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .getToday()
      .then((d) => { if (alive) setToday(d); })
      .catch(() => { /* 后端不可用：保留静态内容 */ });
    return () => { alive = false; };
  }, []);

  const hex = today?.hexagram ?? HEXAGRAMS.tun;
  const hexNote = today?.hexagramNote ?? "起步总是最难的。今天不必急着突破——先扎下一点点根，就够了。";
  const astroHeadline = today?.astroHeadline ?? "月在巨蟹，水象当令。情绪偏柔软，宜慢。";
  const moonNote = today?.moonNote ?? "盈凸月，接近圆满。适合把心里的事，慢慢收束。";
  const moodSummary = today?.moodSummary ?? "过去七天，你大多是「平静」的。偶尔的疲惫，也都好好走过来了。";

  // 有真实记录时按 stress(0-10) 画柱高、按情绪配色；没有任何记录则退回静态示意
  const hasTrack = today?.moodTrack?.some((d) => d.mood != null) ?? false;
  const moodTrack = hasTrack
    ? today!.moodTrack.map((d) => ({
        d: d.label,
        h: d.mood ? Math.round(24 + (d.stress ?? 0) * 5.6) : 12,
        c: d.mood ? MOOD_COLORS[d.mood] ?? "#9FAAB4" : "rgba(43,42,40,0.10)",
      }))
    : FALLBACK_MOOD_TRACK;

  return (
    <div className="animate-gxFade" style={{ maxWidth: 1240, margin: "0 auto" }}>
      {/* 页头 */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-serif" style={{ fontSize: "clamp(26px,3vw,34px)", color: "#2B2A28", fontWeight: 500 }}>晚上好，徐之</div>
          <div style={{ fontSize: 13, color: "#928C81", marginTop: 9, letterSpacing: 0.5 }}>月在巨蟹，水象当令。今天宜慢，也宜先照顾自己。</div>
        </div>
        <Link href="/app/journal" className="flex items-center gap-[9px]" style={{ border: "1px solid rgba(60,74,102,0.2)", background: "rgba(255,255,255,0.5)", padding: "11px 20px", borderRadius: 12, color: "#3C4A66", fontSize: 13.5 }}>记录此刻心境</Link>
      </div>

      <div className="grid gap-[22px] lg:grid-cols-[minmax(0,2.1fr)_minmax(260px,1fr)]">
        {/* 主列 */}
        <div className="flex min-w-0 flex-col gap-[22px]">
          <div className="grid gap-[22px] sm:grid-cols-2">
            {/* 今日星象 */}
            <div className="gx-night" style={{ position: "relative", borderRadius: 22, overflow: "hidden", padding: 28, minHeight: 240, boxShadow: "0 24px 50px -28px rgba(22,27,42,0.6)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <svg viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
                <g stroke="rgba(255,255,255,0.16)" strokeWidth="0.7"><line x1="40" y1="44" x2="110" y2="74" /><line x1="110" y1="74" x2="176" y2="48" /></g>
                <g fill="#fff"><circle cx="40" cy="44" r="1.7" /><circle cx="110" cy="74" r="2.2" /><circle cx="176" cy="48" r="1.5" /><circle cx="262" cy="120" r="2.3" fill="#E7CF95" /><circle cx="70" cy="170" r="1.4" /></g>
              </svg>
              <div style={{ position: "relative" }}>
                <div className="flex items-center justify-between">
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(221,224,238,0.5)" }}>今 日 星 象</div>
                  <Moon size={34} />
                </div>
                <div className="font-serif" style={{ fontSize: 18, lineHeight: 1.85, color: "#EFEBE2", marginTop: 18 }}>{astroHeadline}</div>
              </div>
              <div style={{ position: "relative", fontSize: 11.5, color: "rgba(226,222,236,0.55)", lineHeight: 1.7, marginTop: 18 }}>{moonNote}</div>
            </div>

            {/* 今日一卦 */}
            <Card strong style={{ borderRadius: 22, padding: 28, minHeight: 240, boxShadow: "0 14px 34px -26px rgba(43,42,40,0.4)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#A39C8F" }}>今 日 一 卦</div>
                  <div className="font-serif" style={{ fontSize: 28, color: "#2B2A28", fontWeight: 500, marginTop: 12, letterSpacing: 4 }}>{hex.name}</div>
                  <div className="font-spectral" style={{ fontStyle: "italic", fontSize: 12.5, color: "#938D82", marginTop: 5 }}>{hex.pinyin} · {hex.meaning}</div>
                </div>
                <HexLines lines={hex.lines} width={60} />
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.95, color: "#46433C", marginTop: 18 }}>{hexNote}</div>
            </Card>
          </div>

          {/* 最近问卦（接后端 GET /api/divination/records，带 empty state 与 mock fallback）*/}
          <RecentDivinations />

          {/* 最近情绪轨迹 */}
          <Card style={{ borderRadius: 22, padding: "26px 28px" }}>
            <div className="mb-[22px] flex items-center justify-between">
              <Label>最 近 情 绪 轨 迹</Label>
              <Link href="/app/journal" style={{ fontSize: 12, color: "#3C4A66" }}>心境 ›</Link>
            </div>
            <div className="flex items-end justify-between" style={{ height: 84 }}>
              {moodTrack.map((b, i) => (
                <div key={`${b.d}-${i}`} className="flex flex-1 flex-col items-center gap-[9px]">
                  <div style={{ width: 10, height: b.h, borderRadius: 6, background: b.c }} />
                  <span style={{ fontSize: 10, color: "#A39C8F" }}>{b.d}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12.5, color: "#7C766B", lineHeight: 1.8, marginTop: 18 }}>{moodSummary}</div>
          </Card>
        </div>

        {/* 上下文列 */}
        <div className="flex min-w-0 flex-col gap-[22px]">
          {/* 小易陪伴 */}
          <div style={{ borderRadius: 22, padding: 26, background: "linear-gradient(165deg, rgba(60,74,102,0.08), rgba(176,142,84,0.05))", border: "1px solid rgba(60,74,102,0.13)" }}>
            <XiaoyiOrb size={54} breathe className="mb-[18px]" />
            <div className="font-serif" style={{ fontSize: 16, color: "#2B2A28", lineHeight: 1.7 }}>今天不用急着想清楚全部，先照顾好自己就好。</div>
            <Link href="/app/chat" className="mt-5 block w-full rounded-[13px] text-center" style={{ padding: 13, background: ACCENT, color: "#F3EFE7", fontSize: 13.5, letterSpacing: 1 }}>和小易聊聊</Link>
          </div>

          {/* 情绪入口 */}
          <Card style={{ borderRadius: 22, padding: "24px 26px" }}>
            <Label className="mb-4">此 刻 心 情</Label>
            <div className="grid grid-cols-3 gap-[9px]">
              {[
                { t: "平静", active: false },
                { t: "疲惫", active: true },
                { t: "期待", active: false },
              ].map((m) => (
                <div key={m.t} className="text-center" style={{ padding: "9px 0", borderRadius: 11, border: m.active ? `1px solid ${ACCENT}` : "1px solid rgba(43,42,40,0.13)", background: m.active ? "rgba(60,74,102,0.06)" : "transparent", fontSize: 13, color: m.active ? "#2B2A28" : "#857F74" }}>{m.t}</div>
              ))}
            </div>
            <Link href="/app/journal" className="mt-4 block w-full rounded-xl text-center" style={{ padding: 12, border: "1px solid rgba(60,74,102,0.22)", color: "#3C4A66", fontSize: 13 }}>写进今天的心境</Link>
          </Card>

          {/* 报告入口 */}
          <Link href="/app/report" style={{ borderRadius: 22, padding: "24px 26px", background: "rgba(34,41,61,0.04)", border: "1px solid rgba(60,74,102,0.12)", display: "block" }}>
            <div className="flex items-center justify-between">
              <Label>深 度 报 告</Label>
              <span style={{ color: "#B0A99D" }}>›</span>
            </div>
            <div className="font-serif" style={{ fontSize: 16, color: "#2B2A28", marginTop: 14, lineHeight: 1.7 }}>三月 · 你的星象与情绪主题</div>
            <div style={{ fontSize: 12, color: "#928C81", marginTop: 9, lineHeight: 1.7 }}>一份可以慢慢读的长文，关于这段时间的你。</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
