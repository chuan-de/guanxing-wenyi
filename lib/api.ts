// 统一 API client：封装后端调用。
// - 读取 NEXT_PUBLIC_API_BASE_URL（默认 http://localhost:8080），内部拼接 /api
// - 自动带 X-User-Id 头（浏览器持久化一个 id；SSR 时为 anonymous）
// - 解包后端统一信封 { code, message, data }（code!=0 视为错误，抛 ApiError）
// - 8s 超时
// 调用方（store / 页面）负责在失败时回退到本地 mock —— 本文件只管网络。

const API_ROOT = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ?? // 兼容旧变量名
  "http://localhost:8080"
).replace(/\/+$/, "");

export const API_BASE = `${API_ROOT}/api`;

/** 统一错误类型：网络失败、非 2xx、或业务 code!=0。 */
export class ApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function userId(): string {
  if (typeof window === "undefined") return "anonymous";
  try {
    let id = window.localStorage.getItem("gxwy.userId");
    if (!id) {
      id = "demo-user";
      window.localStorage.setItem("gxwy.userId", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

interface Envelope<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId(),
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new ApiError(-1, `HTTP ${res.status}`, res.status);
  const json = (await res.json()) as Envelope<T>;
  if (json.code !== 0) throw new ApiError(json.code, json.message || "api error", res.status);
  return json.data;
}

const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

/* ===== 类型（与后端 DTO 对齐）===== */
export interface HexagramDTO {
  name: string;
  pinyin: string;
  meaning: string;
  lines: boolean[];
}
export interface CastResp {
  id: string;
  question: string;
  hexagram: HexagramDTO;
  changingLines: number[];
  changingTo: HexagramDTO | null;
  poem: string;
  createdAt: number;
}
export interface InterpretResp {
  divinationId: string;
  hexName: string;
  changingTo: string | null;
  reading: { xiang: string; yi: string; xing: string };
  reflectQuestion: string;
  summary: string;
}
export interface DivinationRecordDTO {
  id: string;
  originalQuestion: string;
  question: string;
  refinedQuestions: string[];
  hexName: string;
  hexPinyin: string;
  changingTo: string | null;
  poem: string | null;
  summary: string | null;
  interpreted: boolean;
  createdAt: number;
}
export interface ChatResp {
  conversationId: string;
  userMessageId: string;
  reply: { id: string; role: string; content: string; createdAt: number };
}
export interface JournalDTO {
  id: string;
  mood: string;
  stress: number;
  smallThing: string;
  createdAt: number;
}
export interface PageResp<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
}
export interface RelationshipPerson {
  name: string;
  sign: string;
  birth: string;
}
export interface RelationshipAnalyzeResp {
  id: string;
  relationHexagram: HexagramDTO;
  analysis: { attraction: string; care: string; communication: string };
  closingLine: string;
  chart: Record<string, unknown>;
  createdAt: number;
}

/* ===== 接口 ===== */
export const api = {
  refineQuestion: (question: string) =>
    post<{ questions: string[] }>("/divination/refine-question", { question }),

  cast: (
    question: string,
    questionType?: string,
    originalQuestion?: string,
    refinedQuestions?: string[],
  ) =>
    post<CastResp>("/divination/cast", {
      question,
      questionType,
      originalQuestion,
      refinedQuestions,
    }),

  interpret: (divinationId: string) =>
    post<InterpretResp>("/divination/interpret", { divinationId }),

  listDivinations: (limit = 10) =>
    request<DivinationRecordDTO[]>(`/divination/records?limit=${limit}`),

  chat: (conversationId: string | null, message: string) =>
    post<ChatResp>("/assistant/chat", { conversationId, message }),

  createJournal: (mood: string, stress: number, smallThing: string) =>
    post<JournalDTO>("/mood-journals", { mood, stress, smallThing }),

  listJournals: (page = 1, size = 50) =>
    request<PageResp<JournalDTO>>(`/mood-journals?page=${page}&size=${size}`),

  analyzeRelationship: (self: RelationshipPerson, partner: RelationshipPerson) =>
    post<RelationshipAnalyzeResp>("/relationship/analyze", { self, partner }),
};
