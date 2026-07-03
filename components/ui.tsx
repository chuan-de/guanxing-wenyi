import * as React from "react";

export const ACCENT = "#3C4A66";

/* 月白半透明卡片 */
export function Card({
  children,
  className = "",
  style,
  strong = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  strong?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`${strong ? "gx-card-strong" : "gx-card"} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* 节区小标题(字间隔) */
export function Label({
  children,
  className = "",
  color = "#A39C8F",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={className}
      style={{ fontSize: 10, letterSpacing: 4, color, fontWeight: 500 }}
    >
      {children}
    </div>
  );
}

/* 页头标题 */
export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div
        className="font-serif"
        style={{ fontSize: "clamp(24px,2.8vw,30px)", color: "#2B2A28", fontWeight: 500 }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 13, color: "#928C81", marginTop: 8, lineHeight: 1.8 }}>{subtitle}</div>
      )}
    </div>
  );
}
