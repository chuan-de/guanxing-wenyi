"use client";

import { useEffect, useState } from "react";
import { Card, Label } from "@/components/ui";
import { HexLines } from "@/components/primitives";
import { HEXAGRAMS } from "@/lib/hexagrams";
import { api, type RelationshipAnalyzeResp, type RelationshipPerson } from "@/lib/api";

const SIGNS = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];

interface Pair {
  self: RelationshipPerson;
  partner: RelationshipPerson;
}

const DEFAULT_PAIR: Pair = {
  self: { name: "你", sign: "双鱼", birth: "1992 · 春分 · 月在巨蟹" },
  partner: { name: "之珩", sign: "天蝎", birth: "1990 · 立冬 · 月在白羊" },
};

const PAIR_KEY = "gxwy.lovePair";

const FALLBACK_ANALYSIS = [
  { dot: "#3C4A66", t: "吸引点", d: "你的金星，与 TA 的火星轻轻相触——你们之间有一种不必刻意的吸引。在一起时，时间总是过得很快。" },
  { dot: "#B08E54", t: "需要照顾的地方", d: "你的月亮在水象，需要被靠近；TA 的月亮在火象，需要一点空间。这不是问题，只是两种不同的呼吸。" },
  { dot: "#3C4A66", t: "沟通建议", d: "当你想靠近、而 TA 想喘口气时，试着说出来，而不是猜。一句「我现在有点需要你」，胜过十次默默的等待。" },
];
const FALLBACK_CLOSING = "你们这段关系的功课：在亲密与独立之间，各自找到呼吸的位置。";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1px solid rgba(43,42,40,0.12)",
  background: "rgba(255,255,255,0.65)", borderRadius: 10, fontSize: 13,
  color: "#2B2A28", outline: "none", caretColor: "#3C4A66",
};

function PersonFields({ label, value, onChange }: {
  label: string;
  value: RelationshipPerson;
  onChange: (p: RelationshipPerson) => void;
}) {
  return (
    <div className="flex flex-col gap-[8px]" style={{ padding: "10px 0" }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: "#A39C8F" }}>{label}</div>
      <div className="flex gap-[8px]">
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="称呼"
          style={{ ...INPUT_STYLE, flex: 1 }}
        />
        <select
          value={value.sign}
          onChange={(e) => onChange({ ...value, sign: e.target.value })}
          style={{ ...INPUT_STYLE, flex: 1 }}
        >
          {SIGNS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <input
        value={value.birth}
        onChange={(e) => onChange({ ...value, birth: e.target.value })}
        placeholder="生辰，如 1992 · 春分 · 月在巨蟹"
        style={INPUT_STYLE}
      />
    </div>
  );
}

export default function LovePage() {
  const [pair, setPair] = useState<Pair>(DEFAULT_PAIR);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Pair>(DEFAULT_PAIR);
  const [resp, setResp] = useState<RelationshipAnalyzeResp | null>(null);

  // 挂载时恢复本地保存的两人信息
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PAIR_KEY);
      if (raw) setPair(JSON.parse(raw) as Pair);
    } catch {
      /* 数据损坏时保留默认 */
    }
  }, []);

  // 两人信息变化（含首载）时请求分析；旧结果保留到新结果返回，避免闪烁
  useEffect(() => {
    let alive = true;
    api
      .analyzeRelationship(pair.self, pair.partner)
      .then((data) => {
        if (alive) setResp(data);
      })
      .catch(() => {
        /* 后端不可用：保留下方的本地静态内容 */
      });
    return () => {
      alive = false;
    };
  }, [pair]);

  const startEdit = () => {
    setDraft({ self: { ...pair.self }, partner: { ...pair.partner } });
    setEditing(true);
  };
  const saveEdit = () => {
    const cleaned: Pair = {
      self: { ...draft.self, name: draft.self.name.trim() || "你" },
      partner: { ...draft.partner, name: draft.partner.name.trim() || "TA" },
    };
    setPair(cleaned);
    try {
      window.localStorage.setItem(PAIR_KEY, JSON.stringify(cleaned));
    } catch {
      /* 存储不可用时仅本次生效 */
    }
    setEditing(false);
  };

  const hex = resp?.relationHexagram ?? HEXAGRAMS.xian;
  const analysis = resp
    ? [
        { dot: "#3C4A66", t: "吸引点", d: resp.analysis.attraction },
        { dot: "#B08E54", t: "需要照顾的地方", d: resp.analysis.care },
        { dot: "#3C4A66", t: "沟通建议", d: resp.analysis.communication },
      ]
    : FALLBACK_ANALYSIS;
  const closingLine = resp?.closingLine ?? FALLBACK_CLOSING;

  return (
    <div className="animate-gxFade" style={{ maxWidth: 1340, margin: "0 auto" }}>
      <div className="mb-6">
        <div className="font-serif" style={{ fontSize: "clamp(24px,2.8vw,30px)", color: "#2B2A28", fontWeight: 500 }}>姻缘</div>
        <div style={{ fontSize: 13, color: "#928C81", marginTop: 8 }}>这里不打分，也不预测结局——只帮你们，更懂彼此的节奏。</div>
      </div>

      <div className="mb-[22px] flex flex-wrap items-stretch gap-[22px]">
        {/* LEFT 两人信息 + 关系卦 */}
        <div className="flex flex-col gap-[18px]" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 380 }}>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-4">两 个 人</Label>
            {!editing ? (
              <>
                {[
                  { dot: "#3C4A66", p: pair.self, b: true },
                  { dot: "#B08E54", p: pair.partner, b: false },
                ].map(({ dot, p, b }, i) => (
                  <div key={i} className="flex items-center gap-[14px]" style={{ padding: "12px 0", borderBottom: b ? "1px solid rgba(43,42,40,0.06)" : "none" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                    <div className="flex-1"><div className="font-serif" style={{ fontSize: 15, color: "#2B2A28" }}>{p.name} · {p.sign}</div><div style={{ fontSize: 11, color: "#A39C8F", marginTop: 3 }}>{p.birth}</div></div>
                  </div>
                ))}
                <button onClick={startEdit} className="mt-[14px] w-full rounded-[11px]" style={{ padding: 11, border: "1px dashed rgba(60,74,102,0.25)", background: "transparent", color: "#3C4A66", fontSize: 12.5 }}>＋ 编辑两人信息</button>
              </>
            ) : (
              <>
                <PersonFields label="你" value={draft.self} onChange={(p) => setDraft((d) => ({ ...d, self: p }))} />
                <div style={{ height: 1, background: "rgba(43,42,40,0.06)" }} />
                <PersonFields label="T A" value={draft.partner} onChange={(p) => setDraft((d) => ({ ...d, partner: p }))} />
                <div className="flex gap-[9px]" style={{ marginTop: 12 }}>
                  <button onClick={saveEdit} className="rounded-[11px]" style={{ flex: 1, padding: 11, border: "none", background: "#3C4A66", color: "#F3EFE7", fontSize: 12.5, letterSpacing: 1 }}>保存并重新分析</button>
                  <button onClick={() => setEditing(false)} className="rounded-[11px]" style={{ flex: 1, padding: 11, border: "1px solid rgba(43,42,40,0.13)", background: "transparent", color: "#928C81", fontSize: 12.5 }}>取消</button>
                </div>
              </>
            )}
          </Card>
          <Card style={{ borderRadius: 20, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
            <HexLines lines={hex.lines} width={56} gap={7} />
            <div>
              <Label>关 系 卦</Label>
              <div className="font-serif" style={{ fontSize: 21, color: "#2B2A28", marginTop: 8, letterSpacing: 3 }}>{hex.name}</div>
              <div style={{ fontSize: 12, color: "#7C766B", lineHeight: 1.7, marginTop: 8 }}>{hex.meaning}，自然相应。<br />你们之间，有一种不必勉强的呼应。</div>
            </div>
          </Card>
        </div>

        {/* CENTER 双盘交叠 */}
        <div className="gx-night" style={{ flex: "2 1 420px", minWidth: 340, position: "relative", borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 60px -32px rgba(22,27,42,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 36, minHeight: 360 }}>
          <svg viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}>
            <g fill="#fff"><circle cx="60" cy="60" r="1.4" /><circle cx="420" cy="80" r="1.6" /><circle cx="440" cy="250" r="1.4" /><circle cx="50" cy="260" r="1.5" /></g>
          </svg>
          <div style={{ position: "relative", fontSize: 10, letterSpacing: 5, color: "rgba(221,224,238,0.5)", marginBottom: 8 }}>双 盘 交 叠</div>
          <svg viewBox="0 0 420 300" style={{ position: "relative", width: "100%", maxWidth: 440 }}>
            <circle cx="165" cy="150" r="118" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="165" cy="150" r="118" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="1 13" />
            <circle cx="165" cy="150" r="86" fill="none" stroke="rgba(147,161,174,0.3)" strokeWidth="1" />
            <circle cx="255" cy="150" r="118" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="255" cy="150" r="118" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="1 13" />
            <circle cx="255" cy="150" r="86" fill="none" stroke="rgba(201,168,120,0.34)" strokeWidth="1" />
            <line x1="165" y1="64" x2="255" y2="236" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" strokeDasharray="2 4" />
            <line x1="80" y1="120" x2="340" y2="180" stroke="rgba(201,168,120,0.3)" strokeWidth="0.8" strokeDasharray="2 4" />
            <circle cx="165" cy="64" r="4" fill="#9FB0C4" /><circle cx="255" cy="236" r="4" fill="#C9A878" />
            <circle cx="80" cy="120" r="3" fill="rgba(255,255,255,0.7)" /><circle cx="340" cy="180" r="3" fill="rgba(201,168,120,0.8)" />
            <circle cx="210" cy="150" r="2.5" fill="rgba(255,255,255,0.5)" />
          </svg>
          <div style={{ position: "relative", display: "flex", gap: 60, marginTop: 14 }}>
            <div className="text-center"><div className="font-serif" style={{ fontSize: 14, color: "#EFEBE2" }}>{pair.self.name} · {pair.self.sign}</div><div style={{ fontSize: 10.5, color: "rgba(226,222,236,0.5)", marginTop: 4 }}>金星 · 巨蟹</div></div>
            <div className="text-center"><div className="font-serif" style={{ fontSize: 14, color: "#EFEBE2" }}>{pair.partner.name} · {pair.partner.sign}</div><div style={{ fontSize: 10.5, color: "rgba(226,222,236,0.5)", marginTop: 4 }}>火星 · 狮子</div></div>
          </div>
        </div>
      </div>

      {/* 三段分析 */}
      <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
        {analysis.map((a) => (
          <Card key={a.t} style={{ borderRadius: 20, padding: 24 }}>
            <div className="mb-[14px] flex items-center gap-[9px]"><span style={{ width: 7, height: 7, borderRadius: "50%", background: a.dot }} /><span style={{ fontSize: 13.5, color: "#2B2A28", fontWeight: 500 }}>{a.t}</span></div>
            <div style={{ fontSize: 14, lineHeight: 1.95, color: "#54514A" }}>{a.d}</div>
          </Card>
        ))}
      </div>

      <div className="mt-7 text-center" style={{ padding: 26, borderRadius: 20, background: "rgba(60,74,102,0.045)", border: "1px solid rgba(60,74,102,0.1)" }}>
        <div className="font-serif" style={{ fontSize: 16, color: "#6B665D", lineHeight: 1.95 }}>「 {closingLine} 」</div>
      </div>
    </div>
  );
}
