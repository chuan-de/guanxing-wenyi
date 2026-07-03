package com.guanxing.wenyi.service.astro;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** 用公开天文事件做地面真值校验。 */
class AstroCalcTest {

    private static double jd(String isoUtc) {
        return AstroCalc.julianDay(Instant.parse(isoUtc));
    }

    /** 角度差归一到 [-180,180]。 */
    private static double diff(double a, double b) {
        double d = (a - b) % 360.0;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        return d;
    }

    @Test
    void sunLongitudeAtEquinoxAndSolstice() {
        // 2024-03-20 03:06 UTC 春分：太阳黄经 = 0°
        assertTrue(Math.abs(diff(AstroCalc.sunLongitude(jd("2024-03-20T03:06:00Z")), 0)) < 0.1);
        // 2023-12-22 03:27 UTC 冬至：太阳黄经 = 270°
        assertTrue(Math.abs(diff(AstroCalc.sunLongitude(jd("2023-12-22T03:27:00Z")), 270)) < 0.1);
    }

    @Test
    void elongationAtNewAndFullMoon() {
        // 2024-04-08 18:18 UTC 日全食（必为朔）：朔望角 ≈ 0
        assertTrue(Math.abs(diff(AstroCalc.elongation(jd("2024-04-08T18:18:00Z")), 0)) < 1.0);
        // 2024-09-18 02:44 UTC 月偏食（必为望）：朔望角 ≈ 180
        assertTrue(Math.abs(diff(AstroCalc.elongation(jd("2024-09-18T02:44:00Z")), 180)) < 1.5);
    }

    @Test
    void moonSignAtSolarEclipse() {
        // 日食时日月同经：2024-04-08 太阳在白羊 ~19°，月亮亦在白羊
        double moonLon = AstroCalc.moonLongitude(jd("2024-04-08T18:18:00Z"));
        assertEquals("白羊", AstroCalc.signName(moonLon));
    }

    @Test
    void signAndElementBins() {
        assertEquals("白羊", AstroCalc.signName(0.5));
        assertEquals("双鱼", AstroCalc.signName(359.9));
        assertEquals("巨蟹", AstroCalc.signName(95));
        assertEquals("火", AstroCalc.elementOf(0));  // 白羊
        assertEquals("水", AstroCalc.elementOf(3));  // 巨蟹
        assertEquals("火", AstroCalc.elementOf(4));  // 狮子
        assertEquals("水", AstroCalc.elementOf(11)); // 双鱼
    }

    @Test
    void moonPhaseBins() {
        assertEquals("新月", AstroCalc.moonPhase(0));
        assertEquals("新月", AstroCalc.moonPhase(359));
        assertEquals("上弦月", AstroCalc.moonPhase(90));
        assertEquals("盈凸月", AstroCalc.moonPhase(135));
        assertEquals("满月", AstroCalc.moonPhase(180));
        assertEquals("亏凸月", AstroCalc.moonPhase(215));
        assertEquals("下弦月", AstroCalc.moonPhase(270));
        assertEquals("残月", AstroCalc.moonPhase(300));
    }
}
