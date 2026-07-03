import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 设计系统 · 东方留白 × 西方星图 × 现代疗愈
        paper: "#F3EFE7", // 月白 · 主背景
        ink: "#2B2A28", // 墨 · 主文字
        stone: "#938D82", // 星灰 · 辅助
        night: "#3C4A66", // 夜空青 · 主强调
        gold: "#B08E54", // 淡金 · 点缀
        goldlite: "#D8BE86",
        cloud: "#EDE8DF",
        mist: "#E3DDD3",
        sand: "#D9D2C6",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif)", "Noto Serif SC", "serif"],
        sans: ["var(--font-noto-sans)", "Noto Sans SC", "sans-serif"],
        spectral: ["var(--font-spectral)", "Spectral", "serif"],
      },
      keyframes: {
        gxFade: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
        gxRise: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "none" },
        },
        gxTwinkle: {
          "0%, 100%": { opacity: ".25" },
          "50%": { opacity: "1" },
        },
        gxDrift: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
        gxFloat: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.015)" },
        },
        gxBreathe: {
          "0%, 100%": { transform: "scale(1)", opacity: ".5" },
          "50%": { transform: "scale(1.14)", opacity: ".9" },
        },
        gxRing: {
          "0%": { transform: "scale(.82)", opacity: ".6" },
          "80%": { opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        gxShake: {
          "0%,100%": { transform: "rotate(-1.1deg)" },
          "50%": { transform: "rotate(1.1deg)" },
        },
        gxSpinSlow: {
          from: { transform: "rotate(0)" },
          to: { transform: "rotate(360deg)" },
        },
        gxWave: {
          "0%, 100%": { transform: "scaleY(0.32)" },
          "50%": { transform: "scaleY(1)" },
        },
        gxHalo: {
          "0%, 100%": { transform: "scale(1)", opacity: ".45" },
          "50%": { transform: "scale(1.16)", opacity: ".85" },
        },
      },
      animation: {
        gxFade: "gxFade .55s ease both",
        gxRise: "gxRise .8s ease both",
        gxTwinkle: "gxTwinkle 5s ease-in-out infinite",
        gxDrift: "gxDrift 7s ease-in-out infinite",
        gxFloat: "gxFloat 12s ease-in-out infinite",
        gxBreathe: "gxBreathe 6s ease-in-out infinite",
        gxShake: "gxShake .85s ease-in-out infinite",
        gxHalo: "gxHalo 2.6s ease-in-out infinite",
        gxWave: "gxWave 1.15s ease-in-out infinite",
      },
      maxWidth: {
        read: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
