"use client";

import { useEffect, useRef, useState } from "react";
import { XiaoyiOrb } from "@/components/primitives";
import { api } from "@/lib/api";

const ACCENT = "#3C4A66";

type Phase = "recording" | "transcribing" | "review";
export type VoiceContext = "ask" | "chat" | "journal";

// 转写走后端 mock 接口；后端不可用时回退这份本地 mock 文本（内容与后端一致）。
const MOCK_TRANSCRIPT: Record<VoiceContext, string> = {
  ask: "最近这段关系让我有点累，常常不知道该继续往前，还是先停一停，先照顾一下自己。",
  chat: "今天有点提不起劲，说不上为什么，就是觉得心里有点空。",
  journal:
    "今天开了一整天会，挺累的。但傍晚走路回家时，风很轻，那一刻，我好像松了一口气。",
};

const USE_LABEL: Record<VoiceContext, string> = {
  ask: "用这段话问卦",
  chat: "发送给小易",
  journal: "记进今天的心境",
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const BARS = [0, 0.16, 0.32, 0.08, 0.28, 0.12, 0.22];

export default function VoiceSheet({
  open,
  context,
  onClose,
  onUse,
}: {
  open: boolean;
  context: VoiceContext;
  onClose: () => void;
  onUse: (text: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("recording");
  const [seconds, setSeconds] = useState(0);
  const [text, setText] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const transTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 打开时重置为「录音中」
  useEffect(() => {
    if (open) {
      setPhase("recording");
      setSeconds(0);
      setText("");
    }
  }, [open]);

  // 录音计时
  useEffect(() => {
    if (phase === "recording" && open) {
      timer.current = setInterval(() => setSeconds((s) => Math.min(90, s + 1)), 1000);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
  }, [phase, open]);

  // 转写中 → 转写结果：调后端 mock 转写接口，失败回退本地文本；
  // 至少停留 900ms，让「转写中」状态不至于一闪而过。
  useEffect(() => {
    if (phase === "transcribing") {
      let alive = true;
      const delay = new Promise((r) => { transTimer.current = setTimeout(r, 900); });
      Promise.all([
        api.transcribeVoice(context, seconds).then((d) => d.text).catch(() => MOCK_TRANSCRIPT[context]),
        delay,
      ]).then(([t]) => {
        if (!alive) return;
        setText(t);
        setPhase("review");
      });
      return () => {
        alive = false;
        if (transTimer.current) clearTimeout(transTimer.current);
      };
    }
    // seconds 只在进入转写时读取一次，不作为依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, context]);

  if (!open) return null;

  const finish = () => setPhase("transcribing");
  const retry = () => { setSeconds(0); setText(""); setPhase("recording"); };
  const use = () => { const t = text.trim(); if (t) onUse(t); onClose(); };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" style={{ animation: "gxFade .28s ease" }}>
      {/* 遮罩 */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{ background: "rgba(16,20,34,0.52)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
      />
      {/* 面板：移动端底部抽屉 / 桌面居中卡片 */}
      <div
        className="relative w-full sm:w-[420px]"
        style={{
          background: "linear-gradient(180deg, #F6F2EA, #EFEAE0)",
          borderRadius: "26px 26px 0 0",
          padding: "24px 24px 30px",
          boxShadow: "0 -20px 50px -20px rgba(0,0,0,0.45)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="sm:hidden" style={{ width: 38, height: 4, borderRadius: 4, background: "rgba(43,42,40,0.16)", margin: "0 auto 18px" }} />

        {/* ===== 录音中 ===== */}
        {phase === "recording" && (
          <>
            <div className="text-center" style={{ fontSize: 10.5, letterSpacing: 3, color: "#A39C8F" }}>正 在 聆 听</div>
            <div className="flex flex-col items-center" style={{ marginTop: 16 }}>
              <div className="font-spectral" style={{ fontSize: 23, color: "#3C4A66", letterSpacing: 1 }}>{fmt(seconds)}</div>
              <div className="relative flex items-center justify-center" style={{ width: 124, height: 124, marginTop: 12 }}>
                <div className="animate-gxHalo" style={{ position: "absolute", inset: 12, borderRadius: "50%", background: "radial-gradient(circle, rgba(60,74,102,0.15), transparent 72%)" }} />
                <div className="flex items-center gap-[5px]" style={{ height: 44 }}>
                  {BARS.map((d, i) => (
                    <div key={i} className="animate-gxWave" style={{ width: 3, height: "100%", borderRadius: 3, background: i === 3 ? "#B08E54" : i % 2 ? "#5C6B86" : "#3C4A66", animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "#928C81", marginTop: 16 }}>把想说的，慢慢说出来就好</div>
            </div>
            <div className="flex items-center justify-center gap-[22px]" style={{ marginTop: 24 }}>
              <button onClick={onClose} className="flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: "50%", border: "1px solid rgba(43,42,40,0.14)", background: "transparent", color: "#928C81", fontSize: 12.5 }}>取消</button>
              <button onClick={finish} className="flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: "50%", border: "none", background: ACCENT, boxShadow: "0 12px 26px -10px rgba(43,53,74,0.55)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#F3EFE7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <div className="text-center" style={{ fontSize: 10.5, color: "#BBB4A8", marginTop: 16 }}>最长 90 秒　·　仅在录音时使用麦克风</div>
          </>
        )}

        {/* ===== 转写中 ===== */}
        {phase === "transcribing" && (
          <div className="flex flex-col items-center" style={{ padding: "26px 0 18px" }}>
            <XiaoyiOrb size={48} breathe />
            <div className="font-serif" style={{ fontSize: 16, color: "#2B2A28", marginTop: 18 }}>正在把声音，轻轻转成文字……</div>
            <div style={{ fontSize: 12.5, color: "#928C81", marginTop: 9 }}>稍等一下，马上就好</div>
          </div>
        )}

        {/* ===== 转写结果确认 ===== */}
        {phase === "review" && (
          <>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 10.5, letterSpacing: 3, color: "#A39C8F" }}>转 写 文 字</span>
              <button onClick={() => setText("")} className="flex items-center gap-[5px]" style={{ border: "none", background: "transparent", color: "#A39C8F", fontSize: 12 }}>清空</button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="font-serif"
              style={{ width: "100%", marginTop: 12, minHeight: 104, border: "1px solid rgba(43,42,40,0.1)", background: "rgba(255,255,255,0.6)", borderRadius: 14, padding: "15px 16px", resize: "none", outline: "none", fontSize: 16, lineHeight: 1.9, color: "#2B2A28", caretColor: "#3C4A66" }}
            />
            <div style={{ fontSize: 11.5, color: "#A39C8F", margin: "12px 2px 0", lineHeight: 1.7 }}>可以直接修改这段文字，删掉不想要的部分。</div>
            <button onClick={use} className="font-serif w-full" style={{ marginTop: 20, padding: 16, border: "none", borderRadius: 15, background: ACCENT, color: "#F3EFE7", fontSize: 15, letterSpacing: 3 }}>{USE_LABEL[context]}</button>
            <button onClick={retry} className="w-full" style={{ marginTop: 10, padding: 14, border: "none", background: "transparent", color: "#928C81", fontSize: 13 }}>重新说一次</button>
          </>
        )}
      </div>
    </div>
  );
}
