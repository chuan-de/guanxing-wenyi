import type { Metadata, Viewport } from "next";
import { Noto_Serif_SC, Noto_Sans_SC, Spectral } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-noto-serif",
  display: "swap",
});

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-noto-sans",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

export const metadata: Metadata = {
  title: "观星问易 · 在星象与卦象之间，照见此刻的自己",
  description:
    "观星问易是一个东西方结合的情绪陪伴产品：借助占星与周易的象征语言，陪你缓解压力、整理情绪、理解关系，并找到今天可以做的那一件小事。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1c2336",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSerif.variable} ${notoSans.variable} ${spectral.variable} font-sans text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
