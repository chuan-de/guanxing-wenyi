// 本地 mock 持久化 —— 第一阶段不接后端，全部存 localStorage。
// 刻意保持极简：只有 load / save / prepend 三个函数 + 两类记录。

export interface DivinationRecord {
  id: string;
  question: string; // 最终用于起卦的问题
  hexName: string; // 本卦名，如 风山渐
  hexPinyin: string;
  changingTo?: string; // 之卦名，如 风地观
  reading: string; // 小易解读摘要(象/译/行的一句)
  createdAt: number;
}

export interface JournalRecord {
  id: string;
  mood: string; // 情绪，如 疲惫
  stress: number; // 紧绷程度 0-10
  smallThing: string; // 今日一件小事 / 一句记录
  createdAt: number;
}

const KEYS = {
  divinations: "gxwy.divinations",
  journals: "gxwy.journals",
} as const;

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, list: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* 忽略写入失败(隐私模式/超额) */
  }
}

export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/* ===== 问卦记录 ===== */
export function loadDivinations(): DivinationRecord[] {
  return load<DivinationRecord>(KEYS.divinations);
}
export function addDivination(rec: DivinationRecord): DivinationRecord[] {
  const list = [rec, ...loadDivinations()].slice(0, 50);
  save(KEYS.divinations, list);
  return list;
}

/* ===== 心境记录 ===== */
export function loadJournals(): JournalRecord[] {
  return load<JournalRecord>(KEYS.journals);
}
export function addJournal(rec: JournalRecord): JournalRecord[] {
  const list = [rec, ...loadJournals()].slice(0, 90);
  save(KEYS.journals, list);
  return list;
}

/* 把时间戳格式化成「三月二十 14:30」式的轻量标签(简化版) */
export function relativeLabel(ts: number): string {
  const diff = Date.now() - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diff < 60 * 1000) return "刚刚";
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))} 分钟前`;
  if (diff < day) return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`;
  if (diff < 2 * day) return "昨天";
  return `${Math.floor(diff / day)} 天前`;
}
