import Link from "next/link";
import { HexLines, Moon } from "@/components/primitives";
import { HEXAGRAMS } from "@/lib/hexagrams";

const PAD = "clamp(24px,5vw,72px)";
const SECTION_PAD = `clamp(72px,9vw,128px) ${PAD}`;

function Stars() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.9 }}
    >
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="0.8">
        <line x1="180" y1="160" x2="300" y2="230" />
        <line x1="300" y1="230" x2="440" y2="180" />
        <line x1="440" y1="180" x2="560" y2="270" />
        <line x1="980" y1="520" x2="1100" y2="470" />
        <line x1="1100" y1="470" x2="1230" y2="560" />
        <line x1="1230" y1="560" x2="1330" y2="500" />
        <line x1="240" y1="640" x2="360" y2="700" />
        <line x1="360" y1="700" x2="470" y2="650" />
      </g>
      <g fill="#fff">
        <circle cx="180" cy="160" r="2" opacity="0.85" className="animate-gxTwinkle" />
        <circle cx="300" cy="230" r="2.6" opacity="0.9" />
        <circle cx="440" cy="180" r="1.8" opacity="0.7" className="animate-gxTwinkle" />
        <circle cx="560" cy="270" r="1.6" opacity="0.6" />
        <circle cx="980" cy="520" r="2" opacity="0.7" />
        <circle cx="1100" cy="470" r="2.4" opacity="0.85" className="animate-gxTwinkle" />
        <circle cx="1230" cy="560" r="1.7" opacity="0.6" />
        <circle cx="1330" cy="500" r="1.5" opacity="0.55" />
        <circle cx="240" cy="640" r="1.6" opacity="0.6" />
        <circle cx="360" cy="700" r="2.1" opacity="0.75" />
        <circle cx="470" cy="650" r="1.5" opacity="0.5" />
        <circle cx="760" cy="120" r="1.4" opacity="0.5" className="animate-gxTwinkle" />
        <circle cx="1320" cy="180" r="1.6" opacity="0.55" />
        <circle cx="120" cy="430" r="1.4" opacity="0.45" />
      </g>
      <circle cx="1150" cy="250" r="80" fill="rgba(231,207,149,0.05)" />
    </svg>
  );
}

const VALUES = [
  {
    title: "西方占星",
    desc: "看见此刻的天象、月相与行运，以及你在其中的位置。",
    icon: (
      <svg width="34" height="34" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="#3C4A66" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="9" y1="13" x2="20" y2="22" stroke="#3C4A66" strokeWidth="1" />
        <line x1="20" y1="22" x2="28" y2="11" stroke="#3C4A66" strokeWidth="1" />
        <circle cx="9" cy="13" r="2" fill="#3C4A66" />
        <circle cx="20" cy="22" r="2.4" fill="#3C4A66" />
        <circle cx="28" cy="11" r="1.8" fill="#B08E54" />
      </svg>
    ),
  },
  {
    title: "东方易经",
    desc: "用六十四卦的卦象照见处境，看见重心——而不是结局。",
    icon: (
      <svg width="34" height="34" viewBox="0 0 36 36">
        <g stroke="#3C4A66" strokeWidth="2.4" strokeLinecap="round">
          <line x1="8" y1="11" x2="28" y2="11" />
          <line x1="8" y1="18" x2="15" y2="18" />
          <line x1="21" y1="18" x2="28" y2="18" />
          <line x1="8" y1="25" x2="28" y2="25" />
        </g>
      </svg>
    ),
  },
  {
    title: "AI 伙伴 小易",
    desc: "陪你把问题问清楚、把情绪说出来，温和地解释卦象与星象。",
    icon: (
      <div style={{ position: "relative", width: 34, height: 34 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 32%, #F4F0E7, #C8CED7 46%, #3C4A66)",
            boxShadow: "inset -4px -4px 8px -4px rgba(20,25,40,0.5)",
          }}
        />
        <div style={{ position: "absolute", top: 7, right: 7, width: 3, height: 3, borderRadius: "50%", background: "#D8BE86" }} />
      </div>
    ),
  },
  {
    title: "情绪陪伴",
    desc: "日记、反思、压力缓解，和今天可以做的那一件小事。",
    icon: (
      <svg width="34" height="34" viewBox="0 0 36 36">
        <path d="M18 29C9 23 6 17 6 13a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 4-3 10-12 16z" fill="none" stroke="#3C4A66" strokeWidth="1.1" />
        <circle cx="18" cy="13" r="1.6" fill="#B08E54" />
      </svg>
    ),
  },
];

const FLOW = [
  { n: "01", t: "说出困扰", d: "用文字或语音，把心里盘旋的事，轻轻说出来。" },
  { n: "02", t: "小易改写", d: "把「会不会」换成「我可以如何」，问得更适合自省。" },
  { n: "03", t: "静心摇签", d: "先深呼吸一次，再慢慢起卦。仪式，是为了让你慢下来。" },
  { n: "04", t: "温和解读", d: "象征、情绪、一件小事、一个反思——而不是吉凶判定。" },
];

const MOOD_BARS = [
  { d: "一", h: 40, c: "#9FAAB4" },
  { d: "二", h: 62, c: "#C2A878" },
  { d: "三", h: 50, c: "#9FAAB4" },
  { d: "四", h: 36, c: "#A7B0A0" },
  { d: "五", h: 70, c: "#C29B86" },
  { d: "六", h: 46, c: "#9FAAB4" },
  { d: "日", h: 38, c: "#9FAAB4" },
];

export default function LandingPage() {
  return (
    <div className="gx-sc" style={{ height: "100vh", overflowY: "auto" }} >
      {/* top nav */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `22px ${PAD}`,
          background: "linear-gradient(180deg, rgba(24,29,44,0.55), rgba(24,29,44,0))",
          backdropFilter: "blur(2px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <svg width="26" height="26" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(243,239,231,0.5)" strokeWidth="1" />
            <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(243,239,231,0.9)" strokeWidth="1" strokeDasharray="0.5 6" />
            <path d="M21 9a8 8 0 1 0 3 8 6.5 6.5 0 0 1-3-8z" fill="#EFEBE2" />
            <circle cx="23" cy="10" r="1.4" fill="#E7CF95" />
          </svg>
          <span className="font-serif" style={{ fontSize: 19, letterSpacing: 3, color: "#F3EFE7" }}>观星问易</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: "clamp(18px,3vw,40px)" }}>
          {["产品", "今日", "小易", "安全边界"].map((t) => (
            <span key={t} className="hidden sm:inline" style={{ fontSize: 13.5, color: "rgba(239,235,226,0.72)", letterSpacing: 1, cursor: "pointer" }}>{t}</span>
          ))}
          <Link href="/app" style={{ border: "1px solid rgba(243,239,231,0.3)", background: "rgba(243,239,231,0.06)", color: "#F3EFE7", fontSize: 13, letterSpacing: 2, padding: "9px 20px", borderRadius: 10 }}>进入工作台</Link>
        </nav>
      </header>

      {/* hero */}
      <section
        style={{
          position: "relative",
          minHeight: "min(94vh,920px)",
          display: "flex",
          alignItems: "center",
          padding: `120px ${PAD} 80px`,
          background: "radial-gradient(130% 100% at 72% 18%, #2C3650 0%, #1E2438 52%, #161B29 100%)",
          overflow: "hidden",
        }}
      >
        <Stars />
        <div
          className="animate-gxFloat"
          style={{
            position: "absolute",
            top: "14%",
            right: "clamp(40px,9vw,160px)",
            width: "clamp(120px,15vw,210px)",
            height: "clamp(120px,15vw,210px)",
            borderRadius: "50%",
            background: "radial-gradient(circle at 64% 36%, #F4F0E6 0%, #DDD6C7 46%, #59668A 100%)",
            boxShadow: "inset -22px 0 40px -14px rgba(16,20,34,0.6), 0 0 90px -10px rgba(231,207,149,0.18)",
          }}
        />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 720 }}>
          <div className="animate-gxFade" style={{ fontSize: 13, letterSpacing: 6, color: "rgba(231,207,149,0.75)", marginBottom: 26 }}>东方易经　·　西方占星　·　现代陪伴</div>
          <h1 className="font-serif animate-gxRise" style={{ fontWeight: 500, fontSize: "clamp(34px,5vw,62px)", lineHeight: 1.4, color: "#F4F0E7", margin: 0, letterSpacing: 2 }}>
            在星象与卦象之间，<br />照见此刻的自己
          </h1>
          <p className="animate-gxRise" style={{ fontWeight: 300, fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 2.1, color: "rgba(231,227,222,0.72)", maxWidth: 560, margin: "30px 0 0" }}>
            观星问易不预测命运，也不替你决定。它借助占星与周易的象征语言，陪你缓解压力、整理情绪、理解关系，并找到今天可以做的那一件小事。
          </p>
          <div className="animate-gxRise" style={{ display: "flex", gap: 16, marginTop: 42, flexWrap: "wrap" }}>
            <Link href="/app/ask" className="font-serif" style={{ background: "linear-gradient(180deg,#C9A867,#B08E54)", color: "#1E2438", fontSize: 16, letterSpacing: 3, padding: "16px 34px", borderRadius: 13, boxShadow: "0 16px 34px -14px rgba(176,142,84,0.6)" }}>开始今日问卦</Link>
            <Link href="/app/chat" className="font-serif" style={{ border: "1px solid rgba(243,239,231,0.32)", background: "rgba(243,239,231,0.05)", color: "#F3EFE7", fontSize: 16, letterSpacing: 3, padding: "16px 34px", borderRadius: 13 }}>与小易聊聊</Link>
          </div>
          <div className="animate-gxFade" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 54 }}>
            <div style={{ width: 1, height: 34, background: "linear-gradient(180deg,rgba(243,239,231,0.4),transparent)" }} />
            <span style={{ fontSize: 11.5, color: "rgba(231,227,222,0.45)", letterSpacing: 2 }}>向下，看看今天的天象与卦象</span>
          </div>
        </div>
      </section>

      {/* VALUE */}
      <section style={{ background: "#EDE8DF", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: "#A39C8F", marginBottom: 20 }}>我 们 做 什 么</div>
          <h2 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(24px,3vw,38px)", lineHeight: 1.55, color: "#2B2A28", margin: 0, maxWidth: 720, letterSpacing: 1 }}>
            四种语言，说的是同一件事——<br />好好对待此刻的自己。
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "clamp(20px,3vw,40px)", marginTop: "clamp(44px,5vw,64px)" }}>
            {VALUES.map((v) => (
              <div key={v.title}>
                {v.icon}
                <div className="font-serif" style={{ fontSize: 18, color: "#2B2A28", marginTop: 18 }}>{v.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.95, color: "#6B665D", marginTop: 11 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TODAY showcase */}
      <section style={{ background: "#E7E1D7", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 5, color: "#A39C8F", marginBottom: 16 }}>今 日</div>
              <h2 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(24px,3vw,36px)", lineHeight: 1.5, color: "#2B2A28", margin: 0, letterSpacing: 1 }}>
                每天的天象与卦象，<br />都是一面温柔的镜子。
              </h2>
            </div>
            <div style={{ fontSize: 12.5, color: "#928C81", letterSpacing: 1 }}>三月二十 · 春分 · 盈凸月</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24, marginTop: "clamp(36px,4vw,52px)" }}>
            <div className="gx-night" style={{ position: "relative", borderRadius: 24, overflow: "hidden", padding: 34, minHeight: 300, boxShadow: "0 30px 60px -30px rgba(22,27,42,0.7)" }}>
              <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6 }}>
                <g stroke="rgba(255,255,255,0.16)" strokeWidth="0.7"><line x1="50" y1="50" x2="130" y2="84" /><line x1="130" y1="84" x2="210" y2="56" /><line x1="300" y1="150" x2="360" y2="120" /></g>
                <g fill="#fff"><circle cx="50" cy="50" r="1.8" /><circle cx="130" cy="84" r="2.2" /><circle cx="210" cy="56" r="1.6" /><circle cx="330" cy="200" r="2.4" fill="#E7CF95" /><circle cx="60" cy="190" r="1.4" /></g>
              </svg>
              <div style={{ position: "relative" }}>
                <div style={{ fontSize: 10, letterSpacing: 4, color: "rgba(221,224,238,0.5)" }}>今 日 星 象</div>
                <div className="font-serif" style={{ fontSize: "clamp(20px,2.4vw,26px)", lineHeight: 1.8, color: "#EFEBE2", marginTop: 18 }}>月在巨蟹，水象当令。<br />情绪偏柔软，宜慢，也宜先照顾自己。</div>
                <div style={{ display: "flex", gap: 15, alignItems: "center", marginTop: 26, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <Moon size={40} />
                  <div style={{ fontSize: 12, color: "rgba(226,222,236,0.62)", lineHeight: 1.7 }}>盈凸月，接近圆满。<br />适合把心里的事，慢慢收束。</div>
                </div>
              </div>
            </div>
            <div className="gx-card-strong" style={{ borderRadius: 24, padding: 34, minHeight: 300, boxShadow: "0 18px 40px -28px rgba(43,42,40,0.4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 4, color: "#A39C8F" }}>今 日 一 卦</div>
                  <div className="font-serif" style={{ fontSize: "clamp(28px,3.4vw,36px)", color: "#2B2A28", fontWeight: 500, marginTop: 14, letterSpacing: 5 }}>{HEXAGRAMS.tun.name}</div>
                  <div className="font-spectral" style={{ fontStyle: "italic", fontSize: 13.5, color: "#938D82", marginTop: 6 }}>{HEXAGRAMS.tun.pinyin} · {HEXAGRAMS.tun.meaning}</div>
                </div>
                <HexLines lines={HEXAGRAMS.tun.lines} width={78} gap={9} />
              </div>
              <div style={{ height: 1, background: "rgba(43,42,40,0.08)", margin: "24px 0" }} />
              <div style={{ fontSize: 15, lineHeight: 2, color: "#46433C" }}>起步总是最难的。今天不必急着突破——先扎下一点点根，就已经够了。</div>
              <div style={{ marginTop: 22, fontSize: 12.5, color: "#928C81", lineHeight: 1.8 }}>这不是替你决定，而是帮你看见当下的重心。</div>
            </div>
          </div>
        </div>
      </section>

      {/* 小易 band */}
      <section style={{ background: "#EDE8DF", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(36px,5vw,72px)", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ position: "relative", width: "clamp(120px,16vw,180px)", height: "clamp(120px,16vw,180px)" }}>
              <div className="animate-gxBreathe" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 38% 34%, #F4F0E7 0%, #C8CED7 42%, #3C4A66 100%)", boxShadow: "inset -16px -14px 30px -14px rgba(20,25,40,0.55), 0 24px 50px -22px rgba(60,74,102,0.5)" }} />
              <div style={{ position: "absolute", top: "24%", right: "24%", width: 8, height: 8, borderRadius: "50%", background: "#D8BE86", boxShadow: "0 0 14px rgba(216,190,134,0.9)" }} />
            </div>
            <div className="font-serif" style={{ fontSize: 22, color: "#2B2A28", marginTop: 26 }}>小易</div>
            <div style={{ fontSize: 13, color: "#928C81", marginTop: 8, lineHeight: 1.8 }}>一个懂占星与周易的陪伴者，<br />不是大师，也不是算命先生。</div>
          </div>
          <div>
            <h2 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(22px,2.6vw,30px)", lineHeight: 1.6, color: "#2B2A28", margin: "0 0 28px", letterSpacing: 1 }}>它不会替你做决定，<br />只是陪你，把话慢慢说清楚。</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: 20, borderRadius: 16, background: "rgba(60,74,102,0.05)", border: "1px solid rgba(60,74,102,0.1)" }}>
                <div style={{ fontSize: 12, color: "#3C4A66", fontWeight: 500, marginBottom: 14 }}>小易会说</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "#54514A", lineHeight: 1.5 }}>
                  <div>「我们先不急着问结果。」</div><div>「这个卦更像在提醒你：现在适合观察。」</div><div>「今天先做一件小事，不用一次想清楚全部。」</div>
                </div>
              </div>
              <div style={{ padding: 20, borderRadius: 16, background: "rgba(43,42,40,0.03)", border: "1px solid rgba(43,42,40,0.08)" }}>
                <div style={{ fontSize: 12, color: "#A39C8F", fontWeight: 500, marginBottom: 14 }}>小易不会说</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "#B0A99D", lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(176,142,84,0.45)" }}>
                  <div>「你们一定会复合。」</div><div>「这是命中注定。」</div><div>「这个卦很凶。」</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section style={{ background: "#E7E1D7", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 5, color: "#A39C8F", marginBottom: 18 }}>问 卦 · 怎 么 进 行</div>
            <h2 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(24px,3vw,34px)", color: "#2B2A28", margin: 0, letterSpacing: 1 }}>四步，从一团乱，到一件小事。</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24, marginTop: "clamp(44px,5vw,64px)" }}>
            {FLOW.map((f) => (
              <div key={f.n} className="gx-card" style={{ padding: "28px 24px", borderRadius: 18 }}>
                <div className="font-spectral" style={{ fontSize: 30, color: "#C9B89A" }}>{f.n}</div>
                <div className="font-serif" style={{ fontSize: 17, color: "#2B2A28", marginTop: 14 }}>{f.t}</div>
                <div style={{ fontSize: 13, lineHeight: 1.9, color: "#6B665D", marginTop: 10 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 陪伴 + 姻缘 */}
      <section style={{ background: "#EDE8DF", padding: SECTION_PAD }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(48px,6vw,88px)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 5, color: "#A39C8F", marginBottom: 16 }}>情 绪 陪 伴</div>
              <h3 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(22px,2.6vw,30px)", lineHeight: 1.6, color: "#2B2A28", margin: "0 0 18px", letterSpacing: 1 }}>把今天，轻轻收好。</h3>
              <p style={{ fontSize: 14.5, lineHeight: 2, color: "#54514A", margin: 0 }}>命名此刻的情绪，记录紧绷的程度，让小易帮你理出压力来源、身体感受和一个反思问题。七天的轨迹，会慢慢告诉你：你比想象中，走得更稳。</p>
            </div>
            <div className="gx-card-strong" style={{ borderRadius: 22, padding: 34 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 96 }}>
                {MOOD_BARS.map((b) => (
                  <div key={b.d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 11, height: b.h, borderRadius: 6, background: b.c }} />
                    <span style={{ fontSize: 10, color: "#A39C8F" }}>{b.d}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12.5, color: "#7C766B", lineHeight: 1.85, marginTop: 20, textAlign: "center" }}>过去七天，你大多是「平静」的。偶尔的疲惫，也都好好走过来了。</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
            <div style={{ order: 2, display: "flex", justifyContent: "center" }}>
              <svg viewBox="0 0 300 200" style={{ width: "100%", maxWidth: 340 }}>
                <circle cx="115" cy="100" r="74" fill="none" stroke="rgba(43,42,40,0.13)" strokeWidth="1" strokeDasharray="1.5 8" />
                <circle cx="185" cy="100" r="74" fill="none" stroke="rgba(43,42,40,0.13)" strokeWidth="1" strokeDasharray="1.5 8" />
                <circle cx="115" cy="100" r="44" fill="none" stroke="rgba(60,74,102,0.22)" strokeWidth="1" />
                <circle cx="185" cy="100" r="44" fill="none" stroke="rgba(176,142,84,0.28)" strokeWidth="1" />
                <line x1="115" y1="56" x2="185" y2="144" stroke="rgba(43,42,40,0.22)" strokeWidth="0.8" strokeDasharray="2 3" />
                <circle cx="115" cy="56" r="4" fill="#3C4A66" /><circle cx="185" cy="144" r="4" fill="#B08E54" /><circle cx="150" cy="100" r="2.2" fill="rgba(43,42,40,0.4)" />
              </svg>
            </div>
            <div style={{ order: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 5, color: "#A39C8F", marginBottom: 16 }}>姻 缘 分 析</div>
              <h3 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(22px,2.6vw,30px)", lineHeight: 1.6, color: "#2B2A28", margin: "0 0 18px", letterSpacing: 1 }}>不打分，也不预测结局。</h3>
              <p style={{ fontSize: 14.5, lineHeight: 2, color: "#54514A", margin: 0 }}>把两个人的星盘轻轻交叠，看见吸引点、需要照顾的地方，和更合适的沟通方式。这里没有「合不合」的判决，只有「如何更懂彼此的节奏」。</p>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section style={{ background: "#22293D", padding: `clamp(64px,8vw,112px) ${PAD}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" style={{ marginBottom: 22 }}>
            <path d="M12 3l7 3v5c0 4.2-2.8 7.8-7 9-4.2-1.2-7-4.8-7-9V6l7-3z" fill="none" stroke="rgba(216,190,134,0.7)" strokeWidth="1.1" />
            <path d="M9 12l2 2 4-4.5" fill="none" stroke="rgba(216,190,134,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 11, letterSpacing: 5, color: "rgba(216,190,134,0.7)", marginBottom: 20 }}>安 全 边 界</div>
          <h2 className="font-serif" style={{ fontWeight: 400, fontSize: "clamp(22px,2.8vw,32px)", lineHeight: 1.7, color: "#F4F0E7", margin: 0, letterSpacing: 1 }}>这不是算命产品。它不预测命运，<br />不制造恐惧，也不诱导你依赖。</h2>
          <p style={{ fontSize: 14, lineHeight: 2.1, color: "rgba(231,227,222,0.6)", maxWidth: 660, margin: "26px auto 0" }}>观星问易是一个情绪陪伴工具，不提供命运预测或医疗诊断。卦象与星象是象征的语言，是镜子，不是答案。当你真的难过时，也请记得——向身边真实的人，或专业人士，伸出手。</p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", background: "radial-gradient(120% 120% at 50% 0%, #2C3650, #1C2336 60%, #161B29)", padding: `clamp(80px,10vw,140px) ${PAD}`, overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(231,207,149,0.1), transparent 70%)" }} />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <h2 className="font-serif" style={{ fontWeight: 500, fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.5, color: "#F4F0E7", margin: 0, letterSpacing: 2 }}>今天，先做一件小事。</h2>
          <p style={{ fontSize: 15, lineHeight: 2, color: "rgba(231,227,222,0.66)", margin: "24px 0 0" }}>不必一次想清楚全部。让小易陪你，从此刻开始。</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
            <Link href="/app/ask" className="font-serif" style={{ background: "linear-gradient(180deg,#C9A867,#B08E54)", color: "#1E2438", fontSize: 16, letterSpacing: 3, padding: "16px 36px", borderRadius: 13, boxShadow: "0 16px 34px -14px rgba(176,142,84,0.6)" }}>开始今日问卦</Link>
            <Link href="/app" className="font-serif" style={{ border: "1px solid rgba(243,239,231,0.3)", background: "rgba(243,239,231,0.05)", color: "#F3EFE7", fontSize: 16, letterSpacing: 3, padding: "16px 36px", borderRadius: 13 }}>进入工作台</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#181D2C", padding: `clamp(48px,6vw,72px) ${PAD} 40px` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 36 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="rgba(243,239,231,0.4)" strokeWidth="1" strokeDasharray="0.5 6" /><path d="M21 9a8 8 0 1 0 3 8 6.5 6.5 0 0 1-3-8z" fill="#EFEBE2" /></svg>
              <span className="font-serif" style={{ fontSize: 16, letterSpacing: 2, color: "#EFEBE2" }}>观星问易</span>
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.9, color: "rgba(231,227,222,0.4)" }}>借象征的语言，<br />陪你照见此刻的自己。</div>
          </div>
          <div><div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(231,227,222,0.4)", marginBottom: 16 }}>产品</div><div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "rgba(231,227,222,0.62)" }}><span>今日工作台</span><span>问卦</span><span>小易</span><span>深度报告</span></div></div>
          <div><div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(231,227,222,0.4)", marginBottom: 16 }}>关于</div><div style={{ display: "flex", flexDirection: "column", gap: 11, fontSize: 13, color: "rgba(231,227,222,0.62)" }}><span>理念</span><span>安全边界</span><span>隐私</span></div></div>
          <div><div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(231,227,222,0.4)", marginBottom: 16 }}>提醒</div><div style={{ fontSize: 12, lineHeight: 1.95, color: "rgba(231,227,222,0.42)" }}>本产品不提供命运预测或医疗诊断。如遇情绪困境，请向专业人士求助。</div></div>
        </div>
        <div style={{ maxWidth: 1180, margin: "36px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 11.5, color: "rgba(231,227,222,0.35)", letterSpacing: 1 }}>
          <span>观星问易 · 观象 v0.1</span><span>© 2026 GuanXing WenYi · 一个情绪陪伴工具</span>
        </div>
      </footer>
    </div>
  );
}
