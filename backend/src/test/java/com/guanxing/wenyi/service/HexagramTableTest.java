package com.guanxing.wenyi.service;

import com.guanxing.wenyi.service.ai.AiService.HexagramData;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class HexagramTableTest {

    @Test
    void has64UniqueHexagrams() {
        List<HexagramData> all = HexagramTable.all();
        assertEquals(64, all.size());
        Set<String> names = new HashSet<>();
        Set<List<Boolean>> lineSets = new HashSet<>();
        for (HexagramData h : all) {
            names.add(h.name());
            lineSets.add(h.lines());
            assertEquals(6, h.lines().size(), h.name());
        }
        assertEquals(64, names.size(), "卦名应互不相同");
        assertEquals(64, lineSets.size(), "爻线应互不相同");
    }

    @Test
    void knownHexagramsMatchFrontendData() {
        // 与前端 lib/hexagrams.ts 既有数据一致
        assertEquals(List.of(true, true, false, true, false, false),
                byName("风山渐").lines());
        assertEquals(List.of(true, true, false, false, false, false),
                byName("风地观").lines());
        assertEquals(List.of(false, true, true, true, false, false),
                byName("泽山咸").lines());
        assertEquals(List.of(false, true, false, false, false, true),
                byName("水雷屯").lines());
        assertEquals("Jiàn", byName("风山渐").pinyin());
        assertEquals("循序渐进", byName("风山渐").meaning());
    }

    @Test
    void changeLineJianThirdYaoGivesGuan() {
        // 风山渐 九三动 → 风地观（与 mock 固定剧本一致）
        HexagramData jian = byName("风山渐");
        assertEquals("风地观", HexagramTable.change(jian, 3).name());
        assertEquals("九三", HexagramTable.yaoName(jian, 3));
    }

    @Test
    void changeAnyLineAlwaysLandsInTable() {
        for (HexagramData hex : HexagramTable.all()) {
            for (int yao = 1; yao <= 6; yao++) {
                HexagramData to = HexagramTable.change(hex, yao);
                assertNotEquals(hex.name(), to.name());
                // 变回来应是原卦
                assertEquals(hex.name(), HexagramTable.change(to, yao).name());
            }
        }
    }

    @Test
    void yaoNames() {
        HexagramData qian = byName("乾为天"); // 全阳
        assertEquals("初九", HexagramTable.yaoName(qian, 1));
        assertEquals("九五", HexagramTable.yaoName(qian, 5));
        assertEquals("上九", HexagramTable.yaoName(qian, 6));
        HexagramData kun = byName("坤为地"); // 全阴
        assertEquals("初六", HexagramTable.yaoName(kun, 1));
        assertEquals("六二", HexagramTable.yaoName(kun, 2));
        assertEquals("上六", HexagramTable.yaoName(kun, 6));
    }

    @Test
    void randomAndInvalidLookup() {
        assertEquals(6, HexagramTable.random(new Random(42)).lines().size());
        assertThrows(IllegalArgumentException.class,
                () -> HexagramTable.byLines(List.of(true, true, true)));
        assertThrows(IllegalArgumentException.class,
                () -> HexagramTable.change(byName("乾为天"), 7));
    }

    private static HexagramData byName(String name) {
        return HexagramTable.all().stream()
                .filter(h -> h.name().equals(name))
                .findFirst().orElseThrow();
    }
}
