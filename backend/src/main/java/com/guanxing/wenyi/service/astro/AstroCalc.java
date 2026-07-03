package com.guanxing.wenyi.service.astro;

import java.time.Instant;

/**
 * 轻量天文计算（Meeus《Astronomical Algorithms》低精度公式）。
 * 精度：太阳黄经 ~0.01°，月亮黄经 ~0.3°——用于星座（30° 一宫）与月相（45° 一相）绰绰有余。
 * 全部纯函数，无外部依赖。
 */
public final class AstroCalc {

    /** 黄道十二宫，从白羊 0° 起，每 30° 一宫。 */
    public static final String[] SIGNS = {
            "白羊", "金牛", "双子", "巨蟹", "狮子", "处女",
            "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼",
    };

    /** 四元素按宫序循环：火土风水。 */
    private static final String[] ELEMENTS = {"火", "土", "风", "水"};

    /** 八相：按日月黄经差（朔望角）每 45° 一相，0°=新月，180°=满月。 */
    public static final String[] MOON_PHASES = {
            "新月", "娥眉月", "上弦月", "盈凸月", "满月", "亏凸月", "下弦月", "残月",
    };

    private AstroCalc() {
    }

    /** 儒略日。 */
    public static double julianDay(Instant t) {
        return t.toEpochMilli() / 86400000.0 + 2440587.5;
    }

    /** 太阳几何黄经（度，[0,360)）。 */
    public static double sunLongitude(double jd) {
        double t = (jd - 2451545.0) / 36525.0;
        double l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
        double m = Math.toRadians(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
        double c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m)
                + (0.019993 - 0.000101 * t) * Math.sin(2 * m)
                + 0.000289 * Math.sin(3 * m);
        return normalize(l0 + c);
    }

    /** 月亮黄经（度，[0,360)）——ELP 级数截断前 15 项。 */
    public static double moonLongitude(double jd) {
        double t = (jd - 2451545.0) / 36525.0;
        double lp = 218.3164477 + 481267.88123421 * t; // 平黄经
        double d = Math.toRadians(297.8501921 + 445267.1114034 * t);  // 平距角
        double m = Math.toRadians(357.5291092 + 35999.0502909 * t);   // 太阳平近点角
        double mp = Math.toRadians(134.9633964 + 477198.8675055 * t); // 月亮平近点角
        double f = Math.toRadians(93.2720950 + 483202.0175233 * t);   // 升交点距角

        double lon = lp
                + 6.288774 * Math.sin(mp)
                + 1.274027 * Math.sin(2 * d - mp)
                + 0.658314 * Math.sin(2 * d)
                + 0.213618 * Math.sin(2 * mp)
                - 0.185116 * Math.sin(m)
                - 0.114332 * Math.sin(2 * f)
                + 0.058793 * Math.sin(2 * d - 2 * mp)
                + 0.057066 * Math.sin(2 * d - m - mp)
                + 0.053322 * Math.sin(2 * d + mp)
                + 0.045758 * Math.sin(2 * d - m)
                - 0.040923 * Math.sin(m - mp)
                - 0.034720 * Math.sin(d)
                - 0.030383 * Math.sin(m + mp)
                + 0.015327 * Math.sin(2 * d - 2 * f)
                - 0.012528 * Math.sin(mp + 2 * f);
        return normalize(lon);
    }

    /** 朔望角：月亮黄经 − 太阳黄经（度，[0,360)）。0=朔，180=望。 */
    public static double elongation(double jd) {
        return normalize(moonLongitude(jd) - sunLongitude(jd));
    }

    /** 黄经 → 宫位下标（0=白羊 … 11=双鱼）。 */
    public static int signIndex(double longitude) {
        return (int) (normalize(longitude) / 30.0);
    }

    public static String signName(double longitude) {
        return SIGNS[signIndex(longitude)];
    }

    /** 宫位 → 元素（火土风水循环）。 */
    public static String elementOf(int signIndex) {
        return ELEMENTS[Math.floorMod(signIndex, 4)];
    }

    /** 朔望角 → 月相名（每相 ±22.5°）。 */
    public static String moonPhase(double elongation) {
        int idx = (int) Math.floor(normalize(elongation + 22.5) / 45.0) % 8;
        return MOON_PHASES[idx];
    }

    private static double normalize(double deg) {
        double r = deg % 360.0;
        return r < 0 ? r + 360.0 : r;
    }
}
