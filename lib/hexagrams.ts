// 卦象数据 —— 每条爻由上至下排列，true = 阳爻(实线)，false = 阴爻(断线)
export type Yao = boolean; // true=阳, false=阴

export interface Hexagram {
  name: string; // 中文卦名
  pinyin: string; // 拼音
  meaning: string; // 一句象意
  lines: Yao[]; // 6 条爻，由上到下
}

export const HEXAGRAMS: Record<string, Hexagram> = {
  tun: {
    name: "水雷屯",
    pinyin: "Tún",
    meaning: "起步维艰",
    lines: [false, true, false, false, false, true],
  },
  jian: {
    name: "风山渐",
    pinyin: "Jiàn",
    meaning: "循序渐进",
    lines: [true, true, false, true, false, false],
  },
  guan: {
    name: "风地观",
    pinyin: "Guān",
    meaning: "静观其变",
    lines: [true, true, false, false, false, false],
  },
  xian: {
    name: "泽山咸",
    pinyin: "Xián",
    meaning: "无心而感",
    lines: [false, true, true, true, false, false],
  },
};

// 风山渐 九三 变爻（由上到下第 4 条，index 3）
export const JIAN_CHANGING = [3];
