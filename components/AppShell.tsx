"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, SECONDARY_NAV } from "@/lib/nav";
import { XiaoyiOrb } from "@/components/primitives";
import {
  IconToday,
  IconAsk,
  IconJournal,
  IconLove,
  IconReport,
  IconSystem,
} from "@/components/icons";

const NAV_ICON: Record<string, (p: any) => JSX.Element> = {
  dashboard: IconToday,
  ask: IconAsk,
  journal: IconJournal,
  love: IconLove,
  report: IconReport,
  system: IconSystem,
};

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/");
}

/* ============ 桌面左导航项 ============ */
function NavButton({
  href,
  label,
  active,
  icon,
  small = false,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center gap-[13px] rounded-xl text-left transition-colors hover:bg-night/[0.045]"
      style={{ padding: small ? "11px 14px" : "12px 14px" }}
    >
      {active && (
        <>
          <span className="absolute inset-0 rounded-xl bg-night/[0.08]" />
          {!small && (
            <span className="absolute left-0 top-[24%] bottom-[24%] w-[3px] rounded-[3px] bg-night" />
          )}
        </>
      )}
      <span className="relative z-[1] flex items-center" style={{ color: small ? "#928C81" : "#3C4A66" }}>
        {icon}
      </span>
      <span
        className="relative z-[1]"
        style={{ fontSize: small ? 13 : 14.5, color: small ? "#7C766B" : "#2B2A28", letterSpacing: 1 }}
      >
        {label}
      </span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="gx-app-bg flex h-screen overflow-hidden">
      {/* ============ 桌面左导航 (lg+) ============ */}
      <aside
        className="hidden lg:flex w-[236px] flex-shrink-0 flex-col"
        style={{
          padding: "26px 18px",
          background: "rgba(247,244,237,0.7)",
          borderRight: "1px solid rgba(43,42,40,0.07)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Link href="/" className="flex items-center gap-3" style={{ padding: "6px 10px 22px" }}>
          <svg width="26" height="26" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(60,74,102,0.3)" strokeWidth="1" strokeDasharray="0.5 6" />
            <path d="M21 9a8 8 0 1 0 3 8 6.5 6.5 0 0 1-3-8z" fill="#3C4A66" />
            <circle cx="23" cy="10" r="1.4" fill="#B08E54" />
          </svg>
          <span className="font-serif" style={{ fontSize: 18, letterSpacing: 3, color: "#2B2A28" }}>观星问易</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-[3px]">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICON[item.key];
            const active = isActive(pathname, item.href);
            return (
              <NavButton
                key={item.key}
                href={item.href}
                label={item.label}
                active={active}
                icon={item.key === "chat" ? <XiaoyiOrb size={18} /> : <Icon />}
              />
            );
          })}
        </nav>

        <div className="flex flex-col gap-[3px] pt-[14px]" style={{ borderTop: "1px solid rgba(43,42,40,0.07)" }}>
          {SECONDARY_NAV.map((item) => {
            const Icon = NAV_ICON[item.key];
            return (
              <NavButton
                key={item.key}
                href={item.href}
                label={item.label}
                active={isActive(pathname, item.href)}
                icon={<Icon />}
                small
              />
            );
          })}
          <div className="flex items-center gap-[11px]" style={{ padding: "11px 14px", marginTop: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "radial-gradient(circle at 64% 38%, #F2EEE4, #D6D0C2)", boxShadow: "inset -5px 0 8px -4px rgba(20,25,40,0.3)", flexShrink: 0 }} />
            <div className="min-w-0">
              <div style={{ fontSize: 13, color: "#2B2A28" }}>林徐之</div>
              <div style={{ fontSize: 11, color: "#A39C8F" }}>双鱼 · 月在巨蟹</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============ 主区 ============ */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶栏 */}
        <header
          className="flex flex-shrink-0 items-center justify-between"
          style={{
            height: 66,
            padding: "0 clamp(20px,3vw,40px)",
            borderBottom: "1px solid rgba(43,42,40,0.06)",
            background: "rgba(243,239,231,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* 移动端 logo / 桌面端月相信息 */}
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <svg width="22" height="22" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(60,74,102,0.3)" strokeWidth="1" strokeDasharray="0.5 6" />
              <path d="M21 9a8 8 0 1 0 3 8 6.5 6.5 0 0 1-3-8z" fill="#3C4A66" />
            </svg>
            <span className="font-serif" style={{ fontSize: 16, letterSpacing: 2, color: "#2B2A28" }}>观星问易</span>
          </Link>
          <div className="hidden lg:flex items-center gap-[14px]">
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "radial-gradient(circle at 64% 38%, #F2EEE4, #C9C3B4)", boxShadow: "inset -6px 0 8px -4px rgba(20,25,40,0.4)" }} />
            <span style={{ fontSize: 13, color: "#7C766B", letterSpacing: 1.5 }}>三月二十　·　春分　·　盈凸月</span>
          </div>
          <Link
            href="/app/chat"
            className="flex items-center gap-[9px]"
            style={{ border: "1px solid rgba(60,74,102,0.18)", background: "rgba(60,74,102,0.04)", padding: "8px 16px", borderRadius: 11 }}
          >
            <span style={{ width: 16, height: 16, borderRadius: "50%", background: "radial-gradient(circle at 38% 32%, #F4F0E7, #C8CED7 46%, #3C4A66)" }} />
            <span style={{ fontSize: 12.5, color: "#3C4A66", letterSpacing: 1 }}>问问小易</span>
          </Link>
        </header>

        {/* 内容区(可滚动) */}
        <main
          className="gx-sc flex-1 overflow-y-auto"
          style={{ padding: "clamp(26px,3.5vw,48px) clamp(20px,3vw,40px) 88px" }}
        >
          {children}
        </main>
      </div>

      {/* ============ 移动底部标签栏 (<lg) ============ */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden"
        style={{
          height: 64,
          background: "rgba(247,244,237,0.92)",
          borderTop: "1px solid rgba(43,42,40,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        {NAV_ITEMS.filter((i) => i.mobile).map((item) => {
          const Icon = NAV_ICON[item.key];
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1"
              style={{ color: active ? "#3C4A66" : "#A39C8F" }}
            >
              {item.key === "chat" ? <XiaoyiOrb size={20} /> : <Icon style={{ width: 20, height: 20 }} />}
              <span style={{ fontSize: 10.5, letterSpacing: 1, fontWeight: active ? 500 : 400 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
