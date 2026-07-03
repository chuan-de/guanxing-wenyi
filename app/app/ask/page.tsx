"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, Label, ACCENT } from "@/components/ui";
import { HexLines, XiaoyiOrb } from "@/components/primitives";
import { IconMic, IconInfo, IconArrowRight } from "@/components/icons";
import VoiceSheet from "@/components/VoiceSheet";
import { useAppState } from "@/lib/store";
import { api } from "@/lib/api";
import { HEXAGRAMS, JIAN_CHANGING } from "@/lib/hexagrams";
import { loadDivinations, relativeLabel, type DivinationRecord } from "@/lib/storage";

interface ReadingState {
  xiang: string;
  yi: string;
  xing: string;
  reflectQuestion: string;
  summary: string;
}

const READING_SUMMARY = "渐，循序渐进——它说的不是快或慢，而是按自己的次序来。先观察，再决定。";

export default function AskPage() {
  const { q, setQ, organized, organize, clearOrganized, refineMeta, saveDivination } = useAppState();

  const [shakeP, setShakeP] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [recent, setRecent] = useState<DivinationRecord[]>([]);
  const [recentFromApi, setRecentFromApi] = useState(false);
  const [reading, setReading] = useState<ReadingState | null>(null);

  const pressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const drawTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drawingRef = useRef(false);
  const shakeRef = useRef(0);
  const divinationIdRef = useRef<string | null>(null);

  // 最近问过：优先后端，失败回退本地
  const refreshRecent = useCallback(() => {
    api
      .listDivinations(5)
      .then((rows) => {
        setRecentFromApi(true);
        setRecent(
          rows.map((r) => ({
            id: r.id,
            question: r.question,
            hexName: r.hexName,
            hexPinyin: r.hexPinyin,
            changingTo: r.changingTo ?? undefined,
            reading: r.summary ?? "",
            createdAt: r.createdAt,
          })),
        );
      })
      .catch(() => {
        setRecentFromApi(false);
        setRecent(loadDivinations());
      });
  }, []);

  useEffect(() => { refreshRecent(); }, [refreshRecent]);

  const stopPress = useCallback(() => {
    if (pressRef.current) { clearInterval(pressRef.current); pressRef.current = null; }
    setShaking(false);
  }, []);

  // 起卦 + 解读走后端；失败时 reading 保持 null，界面回退本地写死文案
  const fetchReading = useCallback(async () => {
    try {
      const cast = await api.cast(
        q,
        "关系",
        refineMeta?.original ?? q,
        refineMeta?.candidates ?? [],
      );
      divinationIdRef.current = cast.id;
      const interp = await api.interpret(cast.id);
      setReading({
        xiang: interp.reading.xiang,
        yi: interp.reading.yi,
        xing: interp.reading.xing,
        reflectQuestion: interp.reflectQuestion,
        summary: interp.summary,
      });
      refreshRecent();
    } catch {
      divinationIdRef.current = null;
      setReading(null);
    }
  }, [q, refineMeta, refreshRecent]);

  const doDraw = useCallback(() => {
    if (drawingRef.current) return;
    drawingRef.current = true;
    stopPress();
    void fetchReading();
    if (drawTimer.current) clearTimeout(drawTimer.current);
    drawTimer.current = setTimeout(() => { setDrawn(true); drawingRef.current = false; }, 950);
  }, [stopPress, fetchReading]);

  const startPress = useCallback(() => {
    if (drawingRef.current || drawn) return;
    if (pressRef.current) clearInterval(pressRef.current);
    setShaking(true);
    pressRef.current = setInterval(() => {
      shakeRef.current = Math.min(100, shakeRef.current + 3.4);
      setShakeP(shakeRef.current);
      if (shakeRef.current >= 100) doDraw();
    }, 90);
  }, [doDraw, drawn]);

  const reset = useCallback(() => {
    stopPress();
    drawingRef.current = false;
    shakeRef.current = 0;
    setShakeP(0);
    setDrawn(false);
    setSaved(false);
    setReading(null);
    divinationIdRef.current = null;
  }, [stopPress]);

  useEffect(() => () => { stopPress(); if (drawTimer.current) clearTimeout(drawTimer.current); }, [stopPress]);

  const pick = (question: string) => { setQ(question); clearOrganized(); };

  const onSave = () => {
    if (saved) return;
    saveDivination({
      question: q,
      hexName: HEXAGRAMS.jian.name,
      hexPinyin: HEXAGRAMS.jian.pinyin,
      changingTo: HEXAGRAMS.guan.name,
      reading: reading?.summary ?? READING_SUMMARY,
    });
    setRecent(loadDivinations());
    setSaved(true);
  };

  const jian = HEXAGRAMS.jian;
  const guan = HEXAGRAMS.guan;

  return (
    <div className="animate-gxFade" style={{ maxWidth: 1340, margin: "0 auto" }}>
      <div className="mb-6">
        <div className="font-serif" style={{ fontSize: "clamp(24px,2.8vw,30px)", color: "#2B2A28", fontWeight: 500 }}>问卦</div>
        <div style={{ fontSize: 13, color: "#928C81", marginTop: 8 }}>把心里盘旋的事，轻轻写下来。卦象不预测结果，只帮你看清此刻的位置。</div>
      </div>

      <div className="flex flex-wrap items-stretch gap-[22px]">
        {/* LEFT */}
        <div className="flex flex-col gap-[18px]" style={{ flex: "1 1 300px", minWidth: 280, maxWidth: 380 }}>
          <Card strong style={{ borderRadius: 20, padding: 22 }}>
            <Label>我 想 问</Label>
            <textarea
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="试着从『我可以如何……』开始"
              className="font-serif"
              style={{ width: "100%", marginTop: 14, minHeight: 120, border: "none", background: "transparent", resize: "none", outline: "none", fontSize: 16, lineHeight: 1.9, color: "#2B2A28", caretColor: "#3C4A66" }}
            />
            <div className="flex items-center justify-between" style={{ marginTop: 8, paddingTop: 13, borderTop: "1px solid rgba(43,42,40,0.06)" }}>
              <span style={{ fontSize: 11.5, color: "#A39C8F" }}>不想打字？说给小易听</span>
              <button onClick={() => setVoiceOpen(true)} style={{ width: 38, height: 38, border: "1px solid rgba(60,74,102,0.2)", background: "rgba(60,74,102,0.06)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3C4A66" }}><IconMic /></button>
            </div>
          </Card>

          {/* 小易整理问题 */}
          <div style={{ borderRadius: 20, padding: 22, background: "linear-gradient(165deg, rgba(60,74,102,0.07), rgba(176,142,84,0.05))", border: "1px solid rgba(60,74,102,0.14)" }}>
            <div className="flex items-center gap-[11px]">
              <XiaoyiOrb size={32} />
              <span className="font-serif" style={{ fontSize: 15, color: "#2B2A28" }}>小易帮你问得更清楚</span>
            </div>
            {organized.length === 0 ? (
              <>
                <div style={{ fontSize: 12.5, color: "#6B665D", lineHeight: 1.9, marginTop: 14 }}>我们先不急着问结果。让小易把它，理成几个更适合自省的问法。</div>
                <button onClick={organize} className="w-full rounded-xl" style={{ marginTop: 16, padding: 12, background: ACCENT, color: "#F3EFE7", fontSize: 13.5, letterSpacing: 2 }}>请小易帮我整理</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "#928C81", lineHeight: 1.8, margin: "14px 2px 4px" }}>挑一个最贴近你此刻的——</div>
                <div className="flex flex-col gap-[10px]" style={{ marginTop: 8 }}>
                  {organized.map((question, i) => (
                    <button key={i} onClick={() => pick(question)} className="font-serif text-left" style={{ width: "100%", padding: "13px 15px", border: "1px solid rgba(60,74,102,0.16)", background: "rgba(255,255,255,0.55)", borderRadius: 13, fontSize: 14, lineHeight: 1.75, color: "#2B2A28", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <span style={{ flex: 1 }}>{question}</span>
                      <span style={{ color: "#B08E54", fontSize: 16, flexShrink: 0 }}>›</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-[9px]" style={{ marginTop: 12 }}>
                  <button onClick={organize} style={{ flex: 1, padding: 10, border: "1px solid rgba(60,74,102,0.22)", background: "transparent", borderRadius: 11, color: "#3C4A66", fontSize: 12.5 }}>换一批</button>
                  <button onClick={clearOrganized} style={{ flex: 1, padding: 10, border: "none", background: "transparent", borderRadius: 11, color: "#928C81", fontSize: 12.5 }}>我自己写</button>
                </div>
              </>
            )}
          </div>

          {/* 问题类型 */}
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-[14px]">问 题 类 型</Label>
            <div className="flex flex-wrap gap-[9px]">
              {[
                { t: "关系", active: true },
                { t: "工作", active: false },
                { t: "方向", active: false },
                { t: "自我", active: false },
              ].map((c) => (
                <span key={c.t} style={{ padding: "8px 16px", borderRadius: 20, border: c.active ? `1px solid ${ACCENT}` : "1px solid rgba(43,42,40,0.13)", background: c.active ? "rgba(60,74,102,0.06)" : "transparent", fontSize: 12.5, color: c.active ? "#2B2A28" : "#857F74" }}>{c.t}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* CENTER 摇签仪式 / 结果 */}
        <div className="gx-night" style={{ flex: "2 1 420px", minWidth: 340, position: "relative", borderRadius: 24, overflow: "hidden", minHeight: 600, boxShadow: "0 30px 60px -32px rgba(22,27,42,0.7)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 32px" }}>
          <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
            <g stroke="rgba(255,255,255,0.13)" strokeWidth="0.7"><line x1="80" y1="120" x2="180" y2="170" /><line x1="180" y1="170" x2="290" y2="130" /><line x1="420" y1="520" x2="510" y2="480" /></g>
            <g fill="#fff"><circle cx="80" cy="120" r="1.6" /><circle cx="180" cy="170" r="2.1" /><circle cx="290" cy="130" r="1.4" /><circle cx="500" cy="200" r="2.2" fill="#E7CF95" /><circle cx="90" cy="500" r="1.4" /><circle cx="520" cy="560" r="1.6" /></g>
          </svg>

          {!drawn ? (
            <div className="relative flex w-full flex-1 flex-col items-center justify-center">
              <div className="flex items-center gap-[10px]" style={{ padding: "10px 18px", borderRadius: 30, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "auto", maxWidth: "100%" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: "radial-gradient(circle at 38% 32%, #F4F0E7, #BFC6D3 44%, #586585)" }} />
                <span style={{ fontSize: 12, color: "rgba(231,227,240,0.82)", lineHeight: 1.5 }}>要问的是：「{q.length > 18 ? q.slice(0, 18) + "…" : q}」</span>
              </div>

              <div
                onPointerDown={startPress}
                onPointerUp={stopPress}
                onPointerLeave={stopPress}
                className={shaking ? "animate-gxShake" : "animate-gxDrift"}
                style={{ position: "relative", width: 150, height: 218, margin: "30px 0", cursor: "grab", touchAction: "none", userSelect: "none" }}
              >
                <div style={{ position: "absolute", left: "50%", top: -15, transform: "translateX(-50%)", display: "flex", gap: 6, alignItems: "flex-end", zIndex: 1 }}>
                  {[[34, -7], [46, 0], [38, 4], [50, 0], [35, 8]].map(([h, r], i) => (
                    <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: "linear-gradient(180deg,#F3EFE7,#D4CDBF)", transform: `rotate(${r}deg)` }} />
                  ))}
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 9, bottom: 0, borderRadius: "14px 14px 50% 50% / 9px 9px 26px 26px", background: "linear-gradient(180deg, rgba(180,192,205,0.14), rgba(60,74,102,0.2))", border: "1px solid rgba(200,210,222,0.3)", boxShadow: "inset 0 4px 16px rgba(243,239,231,0.1), inset 0 -16px 28px rgba(16,20,34,0.4), 0 24px 46px -18px rgba(0,0,0,0.55)", overflow: "hidden" }}>
                  <svg viewBox="0 0 150 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}><g stroke="rgba(216,224,235,0.32)" strokeWidth="1"><line x1="32" y1="64" x2="118" y2="64" /><line x1="32" y1="86" x2="66" y2="86" /><line x1="84" y1="86" x2="118" y2="86" /><line x1="32" y1="108" x2="118" y2="108" /></g></svg>
                  <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translateX(-50%)", width: 70, height: 70, borderRadius: "50%", background: "radial-gradient(circle, rgba(216,190,134,0.2), transparent 70%)" }} />
                </div>
                <div style={{ position: "absolute", top: 5, left: 9, right: 9, height: 18, borderRadius: "50%", border: "1px solid rgba(200,210,222,0.45)", background: "rgba(34,42,62,0.5)" }} />
              </div>

              <div style={{ width: "100%", maxWidth: 280, marginTop: "auto" }}>
                <div className="font-serif text-center" style={{ fontSize: 15, color: "#EFEBE2", letterSpacing: 2 }}>{shakeP > 0 ? `凝神…… ${Math.round(shakeP)}%` : "按住签桶，缓缓起卦"}</div>
                <div style={{ height: 3, borderRadius: 3, background: "rgba(255,255,255,0.1)", marginTop: 16, overflow: "hidden" }}><div style={{ height: "100%", width: `${shakeP}%`, background: "linear-gradient(90deg,#93A1AE,#D8BE86)", borderRadius: 3, transition: "width .15s ease" }} /></div>
                <div className="text-center" style={{ fontSize: 11, color: "rgba(231,227,240,0.5)", marginTop: 12, lineHeight: 1.7 }}>手机端可摇一摇　·　桌面端按住或拖动签桶</div>
              </div>
            </div>
          ) : (
            <div className="relative flex w-full animate-gxFade flex-col items-center">
              <div style={{ fontSize: 10, letterSpacing: 5, color: "rgba(216,190,134,0.7)" }}>已 得 一 卦</div>
              <div className="flex items-center gap-[26px]" style={{ marginTop: 26 }}>
                <div className="flex flex-col items-center gap-3">
                  <HexLines lines={jian.lines} changing={JIAN_CHANGING} tone="light" width={54} />
                  <div className="font-serif" style={{ fontSize: 15, color: "#EFEBE2", letterSpacing: 3 }}>{jian.name}</div>
                </div>
                <div className="flex flex-col items-center gap-[5px]" style={{ color: "rgba(216,190,134,0.7)", marginBottom: 20 }}>
                  <IconArrowRight style={{ width: 20, height: 20 }} />
                  <span style={{ fontSize: 9, color: "rgba(231,227,240,0.45)" }}>九三变</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <HexLines lines={guan.lines} tone="light" width={54} />
                  <div className="font-serif" style={{ fontSize: 15, color: "#EFEBE2", letterSpacing: 3 }}>{guan.name}</div>
                </div>
              </div>
              <div className="font-serif text-center" style={{ fontSize: 16, lineHeight: 2, color: "rgba(239,235,226,0.85)", marginTop: 26 }}>水落石出非一夕，山木成荫待几春。</div>
              <div className="flex w-full flex-col gap-3" style={{ maxWidth: 420, marginTop: 26 }}>
                {[
                  { k: "象 · 这一卦在说什么", v: reading?.xiang ?? "渐，是循序渐进。它说的不是快或慢，而是按自己的次序来。" },
                  { k: "译 · 此刻的你", v: reading?.yi ?? "你心里其实已有答案，只是它还需要时间。适合慢慢来，而不是用一个决定定它生死。" },
                  { k: "行 · 今天的一件小事", v: reading?.xing ?? "先不急着下结论。只观察：和 TA 在一起时，你的肩膀是松的，还是紧的？" },
                ].map((b) => (
                  <div key={b.k} style={{ padding: "16px 18px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(216,190,134,0.7)", marginBottom: 9 }}>{b.k}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.9, color: "rgba(231,227,240,0.82)" }}>{b.v}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3" style={{ marginTop: 24 }}>
                <button onClick={onSave} className="font-serif" style={{ padding: "13px 24px", borderRadius: 13, background: saved ? "rgba(216,190,134,0.25)" : "rgba(216,190,134,0.92)", color: saved ? "rgba(231,227,240,0.85)" : "#2B2A28", fontSize: 14, letterSpacing: 2, border: saved ? "1px solid rgba(216,190,134,0.5)" : "none" }}>{saved ? "✓ 已存进最近问过" : "保存这一卦"}</button>
                <Link href="/app/journal" style={{ padding: "13px 20px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(231,227,240,0.78)", borderRadius: 13, fontSize: 13 }}>写进心境</Link>
                <button onClick={reset} style={{ padding: "13px 20px", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(231,227,240,0.7)", borderRadius: 13, fontSize: 13 }}>再问一次</button>
              </div>
              <div className="text-center" style={{ fontSize: 11, color: "rgba(231,227,240,0.45)", marginTop: 16 }}>卦象是一面镜子，不是一个答案。</div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-[18px]" style={{ flex: "1 1 270px", minWidth: 260, maxWidth: 360 }}>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-4">卦 象 预 览</Label>
            <div className="flex flex-col items-center gap-[13px]" style={{ padding: "8px 0" }}>
              <div style={{ opacity: drawn ? 1 : 0.45 }}>
                <HexLines lines={drawn ? jian.lines : HEXAGRAMS.tun.lines} changing={drawn ? JIAN_CHANGING : []} width={64} gap={8} />
              </div>
              <div style={{ fontSize: 12, color: "#928C81" }}>{drawn ? `${jian.name} · ${jian.meaning}` : "起卦后，这里会显示卦象"}</div>
            </div>
          </Card>

          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-1.5">最 近 问 过</Label>
            {recent.length > 0 ? (
              recent.slice(0, 4).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between" style={{ padding: "13px 0", borderBottom: i < Math.min(recent.length, 4) - 1 ? "1px solid rgba(43,42,40,0.06)" : "none" }}>
                  <div className="min-w-0" style={{ marginRight: 12 }}><div style={{ fontSize: 13, color: "#46433C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.question}</div><div style={{ fontSize: 11, color: "#A39C8F", marginTop: 4 }}>{relativeLabel(r.createdAt)}</div></div>
                  <span className="font-serif" style={{ fontSize: 12, color: "#7C766B", letterSpacing: 1, flexShrink: 0 }}>{r.hexName}</span>
                </div>
              ))
            ) : recentFromApi ? (
              <div style={{ padding: "16px 2px 6px", fontSize: 12.5, color: "#A39C8F", lineHeight: 1.95 }}>还没有问过卦。<br />把心里的事写下来，问一卦试试。</div>
            ) : (
              [
                { q: "关于那次面试", t: "3 天前", g: "火天大有" },
                { q: "要不要搬去另一座城", t: "上周", g: "风泽中孚" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding: "13px 0", borderBottom: i === 0 ? "1px solid rgba(43,42,40,0.06)" : "none" }}>
                  <div className="min-w-0"><div style={{ fontSize: 13, color: "#46433C" }}>{r.q}</div><div style={{ fontSize: 11, color: "#A39C8F", marginTop: 4 }}>{r.t}</div></div>
                  <span className="font-serif" style={{ fontSize: 12, color: "#7C766B", letterSpacing: 1, flexShrink: 0, marginLeft: 12 }}>{r.g}</span>
                </div>
              ))
            )}
          </Card>

          <div style={{ borderRadius: 20, padding: 22, background: "rgba(60,74,102,0.05)", border: "1px solid rgba(60,74,102,0.1)" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 13 }}>
              <IconInfo style={{ color: "#B49A66" }} />
              <span style={{ fontSize: 12, color: "#3C4A66", letterSpacing: 1 }}>温和提醒</span>
            </div>
            <div style={{ fontSize: 12.5, lineHeight: 1.95, color: "#6B665D" }}>试着问「我可以如何」，而不是「会不会」。卦象照见的是位置，不是结局。手机端可开启动作感应摇一摇；桌面端按住或拖动签桶即可起卦。</div>
          </div>
        </div>
      </div>

      <VoiceSheet open={voiceOpen} context="ask" onClose={() => setVoiceOpen(false)} onUse={(t) => setQ(t)} />
    </div>
  );
}
