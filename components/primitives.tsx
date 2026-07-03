import * as React from "react";
import type { Yao } from "@/lib/hexagrams";

/* ============ 卦爻线 ============ */
export function HexLines({
  lines,
  changing = [],
  tone = "dark",
  width = 60,
  gap = 7,
}: {
  lines: Yao[];
  changing?: number[];
  tone?: "dark" | "light";
  width?: number;
  gap?: number;
}) {
  const solid = tone === "dark" ? "#2B2A28" : "#EFEBE2";
  const change = "#B08E54";
  return (
    <div
      style={{ width }}
      className="flex flex-col"
    >
      {lines.map((yang, i) => {
        const color = changing.includes(i) ? change : solid;
        const glow = changing.includes(i)
          ? { boxShadow: `0 0 0 3px rgba(176,142,84,0.16)` }
          : undefined;
        return (
          <div key={i} style={{ height: 7, marginTop: i === 0 ? 0 : gap }}>
            {yang ? (
              <div
                style={{ height: 7, background: color, borderRadius: 1.5, ...glow }}
              />
            ) : (
              <div style={{ height: 7, display: "flex", gap: 11 }}>
                <div style={{ flex: 1, background: color, borderRadius: 1.5, ...glow }} />
                <div style={{ flex: 1, background: color, borderRadius: 1.5, ...glow }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============ 小易 · 月白→夜空青球体 + 一点淡金 ============ */
export function XiaoyiOrb({
  size = 34,
  breathe = false,
  className = "",
}: {
  size?: number;
  breathe?: boolean;
  className?: string;
}) {
  const dot = Math.max(2.2, size * 0.085);
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={breathe ? "animate-gxBreathe" : ""}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 32%, #F4F0E7 0%, #C8CED7 44%, #3C4A66 100%)",
          boxShadow:
            "inset -5px -5px 10px -5px rgba(20,25,40,0.55), 0 4px 12px -4px rgba(60,74,102,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: size * 0.21,
          right: size * 0.2,
          width: dot,
          height: dot,
          borderRadius: "50%",
          background: "#D8BE86",
          boxShadow: "0 0 6px rgba(216,190,134,0.9)",
        }}
      />
    </div>
  );
}

/* ============ 月相球体 ============ */
export function Moon({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 64% 38%, #F2EEE4, #C9C3B4)",
        boxShadow: "inset -8px 0 11px -5px rgba(12,16,28,0.5)",
        flexShrink: 0,
      }}
    />
  );
}

/* ============ 星图(沉浸场景顶部装饰) ============ */
export function Starfield({
  viewBox = "0 0 320 200",
  className = "",
  opacity = 0.55,
}: {
  viewBox?: string;
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
    >
      <g stroke="rgba(255,255,255,0.16)" strokeWidth="0.7">
        <line x1="40" y1="44" x2="110" y2="74" />
        <line x1="110" y1="74" x2="176" y2="48" />
        <line x1="176" y1="48" x2="244" y2="78" />
      </g>
      <g fill="#fff">
        <circle cx="40" cy="44" r="1.7" className="animate-gxTwinkle" />
        <circle cx="110" cy="74" r="2.2" />
        <circle cx="176" cy="48" r="1.5" />
        <circle cx="244" cy="78" r="1.6" />
        <circle cx="262" cy="120" r="2.3" fill="#E7CF95" className="animate-gxTwinkle" />
        <circle cx="70" cy="150" r="1.4" />
        <circle cx="300" cy="150" r="1.3" />
        <circle cx="20" cy="96" r="1.2" />
      </g>
    </svg>
  );
}

/* ============ 节标题(小字间隔) ============ */
export function Kicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-sans text-stone ${className}`}
      style={{ fontSize: 10, letterSpacing: 4, color: "#A39C8F", fontWeight: 500 }}
    >
      {children}
    </div>
  );
}
