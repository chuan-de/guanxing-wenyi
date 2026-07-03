"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, Label, ACCENT } from "@/components/ui";
import { HexLines, XiaoyiOrb } from "@/components/primitives";
import { IconMic, IconSend } from "@/components/icons";
import VoiceSheet from "@/components/VoiceSheet";
import { useAppState } from "@/lib/store";
import { HEXAGRAMS } from "@/lib/hexagrams";

export default function ChatPage() {
  const { chatMsgs, chatInput, setChatInput, sendChat } = useAppState();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMsgs]);

  return (
    <div className="animate-gxFade" style={{ maxWidth: 1340, margin: "0 auto" }}>
      <div className="flex flex-wrap items-stretch gap-[22px]">
        {/* LEFT 上下文 */}
        <div className="flex flex-col gap-4" style={{ flex: "1 1 250px", minWidth: 240, maxWidth: 320 }}>
          <div className="gx-night" style={{ position: "relative", borderRadius: 20, overflow: "hidden", padding: 22, minHeight: 150 }}>
            <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
              <g stroke="rgba(255,255,255,0.16)" strokeWidth="0.7"><line x1="40" y1="44" x2="110" y2="70" /><line x1="110" y1="70" x2="176" y2="48" /></g>
              <g fill="#fff"><circle cx="40" cy="44" r="1.6" /><circle cx="110" cy="70" r="2" /><circle cx="176" cy="48" r="1.4" /><circle cx="230" cy="110" r="2.1" fill="#E7CF95" /></g>
            </svg>
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(221,224,238,0.5)" }}>今 日 上 下 文</div>
              <div className="flex items-center gap-3" style={{ marginTop: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "radial-gradient(circle at 66% 38%, #F4F0E6, #C9C3B4)", boxShadow: "inset -8px 0 11px -5px rgba(12,16,28,0.5)" }} />
                <div style={{ fontSize: 13, color: "#EFEBE2", lineHeight: 1.6 }}>月在巨蟹<br /><span style={{ fontSize: 11, color: "rgba(226,222,236,0.55)" }}>盈凸月 · 水象当令</span></div>
              </div>
            </div>
          </div>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-[14px]">最 近 一 卦</Label>
            <div className="flex items-center gap-[14px]">
              <HexLines lines={HEXAGRAMS.jian.lines} changing={[3]} width={42} gap={6} />
              <div><div className="font-serif" style={{ fontSize: 16, color: "#2B2A28", letterSpacing: 2 }}>{HEXAGRAMS.jian.name}</div><div style={{ fontSize: 11, color: "#928C81", marginTop: 4 }}>循序渐进</div></div>
            </div>
          </Card>
          <div style={{ borderRadius: 20, padding: "20px 22px", background: "rgba(60,74,102,0.05)", border: "1px solid rgba(60,74,102,0.1)" }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.95, color: "#6B665D" }}>小易了解你今天的星象与卦象。你不用从头说起，可以直接，从此刻聊起。</div>
          </div>
        </div>

        {/* CENTER 对话 */}
        <div style={{ flex: "2 1 440px", minWidth: 320, display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 520, borderRadius: 24, overflow: "hidden", background: "radial-gradient(120% 70% at 50% 0%, #F3EFE8, #EBE6DC)", border: "1px solid rgba(43,42,40,0.07)" }}>
          <div className="flex flex-shrink-0 items-center gap-3" style={{ padding: "20px 26px", borderBottom: "1px solid rgba(43,42,40,0.06)" }}>
            <XiaoyiOrb size={40} breathe />
            <div>
              <div className="font-serif" style={{ fontSize: 17, color: "#2B2A28" }}>小易</div>
              <div className="flex items-center gap-[5px]" style={{ fontSize: 11, color: "#8A93A2", marginTop: 2 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7C9A7E" }} />安静地陪着你</div>
            </div>
          </div>
          <div ref={scrollRef} className="gx-sc flex-1 overflow-y-auto" style={{ padding: "28px clamp(24px,4vw,52px)" }}>
            <div className="text-center" style={{ fontSize: 11, color: "#B0A99D", marginBottom: 26, letterSpacing: 1 }}>三月二十 · 晚上好</div>
            {chatMsgs.map((m, i) =>
              m.who === "xy" ? (
                <div key={i} className="flex items-start gap-3" style={{ marginBottom: 24, maxWidth: "80%" }}>
                  <XiaoyiOrb size={32} className="flex-shrink-0" />
                  <div style={{ fontSize: 15, lineHeight: 2, color: "#43403A" }}>{m.text}</div>
                </div>
              ) : (
                <div key={i} className="flex justify-end" style={{ marginBottom: 24 }}>
                  <div style={{ maxWidth: "74%", padding: "13px 18px", background: "rgba(60,74,102,0.09)", border: "1px solid rgba(60,74,102,0.13)", borderRadius: "16px 16px 4px 16px", fontSize: 14.5, lineHeight: 1.85, color: "#3A4255" }}>{m.text}</div>
                </div>
              )
            )}
          </div>
          <div className="flex-shrink-0" style={{ padding: "16px clamp(20px,3vw,32px) 22px", borderTop: "1px solid rgba(43,42,40,0.06)" }}>
            <div className="flex items-center gap-[11px]">
              <button onClick={() => setVoiceOpen(true)} style={{ width: 44, height: 44, flexShrink: 0, border: "1px solid rgba(60,74,102,0.2)", background: "rgba(60,74,102,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#3C4A66" }}><IconMic style={{ width: 18, height: 18 }} /></button>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="想说点什么，都可以……"
                style={{ flex: 1, minWidth: 0, border: "1px solid rgba(43,42,40,0.12)", background: "rgba(255,255,255,0.65)", borderRadius: 22, padding: "13px 19px", outline: "none", fontSize: 14.5, color: "#2B2A28", caretColor: "#3C4A66" }}
              />
              <button onClick={() => sendChat()} style={{ width: 44, height: 44, flexShrink: 0, border: "none", borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", color: "#F3EFE7" }}><IconSend /></button>
            </div>
          </div>
        </div>

        {/* RIGHT 小易整理 */}
        <div className="flex flex-col gap-4" style={{ flex: "1 1 250px", minWidth: 240, maxWidth: 320 }}>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-[15px]">此 刻 的 情 绪</Label>
            <div className="flex flex-wrap gap-[9px]">
              <span style={{ padding: "8px 15px", borderRadius: 20, background: "rgba(60,74,102,0.08)", border: "1px solid rgba(60,74,102,0.14)", fontSize: 12.5, color: "#3C4A66" }}>疲惫</span>
              <span style={{ padding: "8px 15px", borderRadius: 20, background: "rgba(176,142,84,0.08)", border: "1px solid rgba(176,142,84,0.18)", fontSize: 12.5, color: "#8A7B57" }}>心里有点空</span>
            </div>
          </Card>
          <Card style={{ borderRadius: 20, padding: 22 }}>
            <Label className="mb-[13px]">也 许 你 想 确 认</Label>
            <div className="font-serif" style={{ fontSize: 14.5, lineHeight: 1.9, color: "#2B2A28" }}>此刻我更需要的，是被理解，还是被陪着？</div>
            <Link href="/app/ask" className="mt-[14px] block w-full rounded-[11px] text-center" style={{ padding: 11, border: "1px solid rgba(60,74,102,0.22)", color: "#3C4A66", fontSize: 12.5 }}>拿去问卦</Link>
          </Card>
          <div style={{ borderRadius: 20, padding: 22, background: "linear-gradient(165deg, rgba(60,74,102,0.07), rgba(176,142,84,0.05))", border: "1px solid rgba(60,74,102,0.13)" }}>
            <Label className="mb-[13px]" color="#7E869A">今 日 一 件 小 事</Label>
            <div style={{ fontSize: 14, lineHeight: 1.9, color: "#46433C" }}>今晚，给自己十分钟，什么都不做，只是坐着。</div>
          </div>
        </div>
      </div>

      <VoiceSheet open={voiceOpen} context="chat" onClose={() => setVoiceOpen(false)} onUse={(t) => sendChat(t)} />
    </div>
  );
}
