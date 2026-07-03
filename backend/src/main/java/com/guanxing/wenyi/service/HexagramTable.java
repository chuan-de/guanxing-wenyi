package com.guanxing.wenyi.service;

import com.guanxing.wenyi.service.ai.AiService.HexagramData;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * 完整六十四卦表。
 * 爻线约定与前端一致：数组由上到下，true=阳爻。
 * 卦序按八宫方图（上卦 × 下卦，均为 乾兑离震巽坎艮坤）。
 */
public final class HexagramTable {

    /** 八经卦的爻线（由上到下）：乾 兑 离 震 巽 坎 艮 坤。 */
    private static final boolean[][] TRIGRAMS = {
            {true, true, true},    // 乾 ☰ 天
            {false, true, true},   // 兑 ☱ 泽
            {true, false, true},   // 离 ☲ 火
            {false, false, true},  // 震 ☳ 雷
            {true, true, false},   // 巽 ☴ 风
            {false, true, false},  // 坎 ☵ 水
            {true, false, false},  // 艮 ☶ 山
            {false, false, false}, // 坤 ☷ 地
    };

    /** NAMES[上卦][下卦] = {卦名, 拼音, 象意}。屯按项目既有约定记 Tún（正音 Zhūn）。 */
    private static final String[][][] NAMES = {
            { // 上乾(天)
                    {"乾为天", "Qián", "自强不息"}, {"天泽履", "Lǚ", "如履薄冰"},
                    {"天火同人", "Tóng Rén", "与人同心"}, {"天雷无妄", "Wú Wàng", "守正不妄"},
                    {"天风姤", "Gòu", "不期而遇"}, {"天水讼", "Sòng", "慎争止讼"},
                    {"天山遁", "Dùn", "退避自守"}, {"天地否", "Pǐ", "闭塞待通"},
            },
            { // 上兑(泽)
                    {"泽天夬", "Guài", "决而能和"}, {"兑为泽", "Duì", "和悦相济"},
                    {"泽火革", "Gé", "顺时而变"}, {"泽雷随", "Suí", "随顺时势"},
                    {"泽风大过", "Dà Guò", "负重慎行"}, {"泽水困", "Kùn", "困而不失"},
                    {"泽山咸", "Xián", "无心而感"}, {"泽地萃", "Cuì", "荟萃聚合"},
            },
            { // 上离(火)
                    {"火天大有", "Dà Yǒu", "丰有守中"}, {"火泽睽", "Kuí", "异中求同"},
                    {"离为火", "Lí", "附丽光明"}, {"火雷噬嗑", "Shì Kè", "咬合破障"},
                    {"火风鼎", "Dǐng", "鼎新去故"}, {"火水未济", "Wèi Jì", "未成待续"},
                    {"火山旅", "Lǚ", "旅居守正"}, {"火地晋", "Jìn", "循序上进"},
            },
            { // 上震(雷)
                    {"雷天大壮", "Dà Zhuàng", "壮而知止"}, {"雷泽归妹", "Guī Mèi", "慎始知终"},
                    {"雷火丰", "Fēng", "丰盛守中"}, {"震为雷", "Zhèn", "惧而后安"},
                    {"雷风恒", "Héng", "恒久不已"}, {"雷水解", "Xiè", "险去缓解"},
                    {"雷山小过", "Xiǎo Guò", "小事宜过"}, {"雷地豫", "Yù", "安而有备"},
            },
            { // 上巽(风)
                    {"风天小畜", "Xiǎo Xù", "小有积蓄"}, {"风泽中孚", "Zhōng Fú", "诚信感通"},
                    {"风火家人", "Jiā Rén", "家道有常"}, {"风雷益", "Yì", "损上益下"},
                    {"巽为风", "Xùn", "谦逊入微"}, {"风水涣", "Huàn", "涣散复聚"},
                    {"风山渐", "Jiàn", "循序渐进"}, {"风地观", "Guān", "静观其变"},
            },
            { // 上坎(水)
                    {"水天需", "Xū", "耐心等待"}, {"水泽节", "Jié", "节制有度"},
                    {"水火既济", "Jì Jì", "成而守成"}, {"水雷屯", "Tún", "起步维艰"},
                    {"水风井", "Jǐng", "井养不穷"}, {"坎为水", "Kǎn", "行险有信"},
                    {"水山蹇", "Jiǎn", "见险知止"}, {"水地比", "Bǐ", "亲比相依"},
            },
            { // 上艮(山)
                    {"山天大畜", "Dà Xù", "厚积待发"}, {"山泽损", "Sǔn", "损而有益"},
                    {"山火贲", "Bì", "文饰得体"}, {"山雷颐", "Yí", "颐养自守"},
                    {"山风蛊", "Gǔ", "整饬积弊"}, {"山水蒙", "Méng", "启蒙初开"},
                    {"艮为山", "Gèn", "知止而止"}, {"山地剥", "Bō", "剥极将复"},
            },
            { // 上坤(地)
                    {"地天泰", "Tài", "通泰安和"}, {"地泽临", "Lín", "临事以宽"},
                    {"地火明夷", "Míng Yí", "晦而转明"}, {"地雷复", "Fù", "一阳来复"},
                    {"地风升", "Shēng", "积小成高"}, {"地水师", "Shī", "行险而顺"},
                    {"地山谦", "Qiān", "谦逊自持"}, {"坤为地", "Kūn", "厚德载物"},
            },
    };

    private static final List<HexagramData> ALL = new ArrayList<>(64);
    private static final Map<String, HexagramData> BY_KEY = new HashMap<>(128);

    static {
        for (int upper = 0; upper < 8; upper++) {
            for (int lower = 0; lower < 8; lower++) {
                List<Boolean> lines = new ArrayList<>(6);
                for (boolean b : TRIGRAMS[upper]) lines.add(b);
                for (boolean b : TRIGRAMS[lower]) lines.add(b);
                String[] meta = NAMES[upper][lower];
                HexagramData hex = new HexagramData(meta[0], meta[1], meta[2], List.copyOf(lines));
                ALL.add(hex);
                BY_KEY.put(key(hex.lines()), hex);
            }
        }
    }

    private HexagramTable() {
    }

    public static List<HexagramData> all() {
        return List.copyOf(ALL);
    }

    public static HexagramData random(Random rnd) {
        return ALL.get(rnd.nextInt(ALL.size()));
    }

    /** 按爻线（由上到下）查卦；不存在时抛异常（六爻必属六十四卦之一，抛出即表数据有误）。 */
    public static HexagramData byLines(List<Boolean> lines) {
        HexagramData hex = BY_KEY.get(key(lines));
        if (hex == null) {
            throw new IllegalArgumentException("卦线不合法: " + lines);
        }
        return hex;
    }

    /** 第 yao 爻（1-6，自下而上）变后的之卦。 */
    public static HexagramData change(HexagramData hex, int yao) {
        if (yao < 1 || yao > 6) {
            throw new IllegalArgumentException("爻号须在 1-6: " + yao);
        }
        List<Boolean> lines = new ArrayList<>(hex.lines());
        int idx = 6 - yao; // 自下而上第 yao 爻 = 由上到下 index 6-yao
        lines.set(idx, !lines.get(idx));
        return byLines(lines);
    }

    /** 爻名：初九/六二/九三/…/上六。 */
    public static String yaoName(HexagramData hex, int yao) {
        boolean yang = hex.lines().get(6 - yao);
        String num = yang ? "九" : "六";
        return switch (yao) {
            case 1 -> "初" + num;
            case 6 -> "上" + num;
            default -> num + "二三四五".charAt(yao - 2);
        };
    }

    private static String key(List<Boolean> lines) {
        StringBuilder sb = new StringBuilder(6);
        for (Boolean b : lines) sb.append(Boolean.TRUE.equals(b) ? '1' : '0');
        return sb.toString();
    }
}
