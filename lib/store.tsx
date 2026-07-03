"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addDivination,
  addJournal,
  loadDivinations,
  loadJournals,
  newId,
  type DivinationRecord,
  type JournalRecord,
} from "@/lib/storage";
import { api } from "@/lib/api";

export interface ChatMsg {
  who: "xy" | "me";
  text: string;
}

const REPLIES = [
  "谢谢你愿意说出来。我们先不急着想清楚全部，把它放在这里，慢慢看就好。",
  "嗯，我听见了。此刻你不需要表现得很好，能照顾好自己，就已经很好。",
  "这件事先不急着下结论。今天，能为自己做一件很小的事吗？哪怕只是喝口水、走两步。",
  "我在的。你说的这些，并不小题大做——会这样累，说明你一直在认真生活。",
];

/* 小易把困扰整理成 2-3 个「我可以如何」式的问题（后端失败时的本地回退） */
export function organizeQuestions(raw: string): string[] {
  const t = (raw || "").trim();
  if (!t) {
    return [
      "此刻，我最想为自己确认的，是什么？",
      "如果只照顾好自己一件事，今天我想从哪里开始？",
    ];
  }
  const short = t.length > 14 ? t.slice(0, 14) + "…" : t;
  return [
    `在「${short}」这件事里，我此刻最想看清的，是什么？`,
    `面对「${short}」，我可以如何先照顾好自己的感受？`,
    `关于「${short}」，我能迈出的、最小的一步是什么？`,
  ];
}

interface AppState {
  q: string;
  setQ: (v: string) => void;
  organized: string[];
  organize: () => void; // 优先后端 refine-question，失败回退本地
  clearOrganized: () => void;
  // 最近一次整理：原始输入 + 候选问题（起卦时随记录持久化）
  refineMeta: { original: string; candidates: string[] } | null;

  chatMsgs: ChatMsg[];
  chatInput: string;
  setChatInput: (v: string) => void;
  sendChat: (text?: string) => void; // 优先后端 chat，失败回退本地 REPLIES

  mood: string;
  setMood: (v: string) => void;
  stress: number;
  setStress: (v: number) => void;
  smallThing: string;
  setSmallThing: (v: string) => void;

  divinations: DivinationRecord[];
  saveDivination: (rec: Omit<DivinationRecord, "id" | "createdAt">) => void;
  journals: JournalRecord[];
  saveJournal: () => void; // 优先后端 POST，失败回退 localStorage
}

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [q, setQ] = useState("这段关系，我该继续投入，还是先退一步？");
  const [organized, setOrganized] = useState<string[]>([]);
  const [refineMeta, setRefineMeta] =
    useState<{ original: string; candidates: string[] } | null>(null);

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { who: "xy", text: "晚上好。今天这一天，过得还好吗？" },
    { who: "me", text: "有点累，说不上来为什么。" },
    {
      who: "xy",
      text: "嗯，那种说不清的累，最磨人。我们先不急着找原因——是身体累，还是心里有点空？",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const conversationIdRef = useRef<string | null>(null);

  const [mood, setMood] = useState("疲惫");
  const [stress, setStress] = useState(6);
  const [smallThing, setSmallThing] = useState("");

  const [divinations, setDivinations] = useState<DivinationRecord[]>([]);
  const [journals, setJournals] = useState<JournalRecord[]>([]);

  // 挂载后：心境优先从后端拉，失败回退本地；问卦记录仍读本地
  useEffect(() => {
    setDivinations(loadDivinations());
    let alive = true;
    api
      .listJournals(1, 90)
      .then((page) => {
        if (!alive) return;
        setJournals(
          page.records.map((r) => ({
            id: r.id,
            mood: r.mood,
            stress: r.stress,
            smallThing: r.smallThing ?? "",
            createdAt: r.createdAt,
          })),
        );
      })
      .catch(() => {
        if (alive) setJournals(loadJournals());
      });
    return () => {
      alive = false;
    };
  }, []);

  const clearOrganized = useCallback(() => setOrganized([]), []);

  const organize = useCallback(() => {
    api
      .refineQuestion(q)
      .then((res) => {
        setOrganized(res.questions);
        setRefineMeta({ original: q, candidates: res.questions });
      })
      .catch(() => {
        const qs = organizeQuestions(q);
        setOrganized(qs);
        setRefineMeta({ original: q, candidates: qs });
      });
  }, [q]);

  const sendChat = useCallback(
    (text?: string) => {
      const t = (text ?? chatInput ?? "").trim();
      if (!t) return;
      // 副作用放在 setState 更新函数之外，避免 StrictMode 下重复触发
      setChatInput("");
      setChatMsgs((msgs) => msgs.concat([{ who: "me", text: t }]));
      // 请求后端，失败回退本地 REPLIES
      api
        .chat(conversationIdRef.current, t)
        .then((res) => {
          conversationIdRef.current = res.conversationId;
          setChatMsgs((msgs) => msgs.concat([{ who: "xy", text: res.reply.content }]));
        })
        .catch(() => {
          setChatMsgs((msgs) => {
            const meCount = msgs.filter((m) => m.who === "me").length;
            const reply = REPLIES[(meCount - 1 + REPLIES.length) % REPLIES.length];
            return msgs.concat([{ who: "xy", text: reply }]);
          });
        });
    },
    [chatInput],
  );

  const saveDivination = useCallback(
    (rec: Omit<DivinationRecord, "id" | "createdAt">) => {
      const full: DivinationRecord = { ...rec, id: newId(), createdAt: Date.now() };
      setDivinations(addDivination(full));
    },
    [],
  );

  const saveJournal = useCallback(() => {
    const optimistic: JournalRecord = {
      id: newId(),
      mood,
      stress,
      smallThing: smallThing.trim(),
      createdAt: Date.now(),
    };
    // 先本地落库 + 即时反馈
    addJournal(optimistic);
    setJournals((list) => [optimistic, ...list].slice(0, 90));
    // 再尝试后端持久化（失败则保持本地记录）
    api
      .createJournal(optimistic.mood, optimistic.stress, optimistic.smallThing)
      .then((saved) => {
        setJournals((list) =>
          list.map((j) =>
            j.id === optimistic.id
              ? {
                  id: saved.id,
                  mood: saved.mood,
                  stress: saved.stress,
                  smallThing: saved.smallThing ?? "",
                  createdAt: saved.createdAt,
                }
              : j,
          ),
        );
      })
      .catch(() => {
        /* 后端不可用：保留本地记录即可 */
      });
  }, [mood, stress, smallThing]);

  const value: AppState = {
    q,
    setQ,
    organized,
    organize,
    clearOrganized,
    refineMeta,
    chatMsgs,
    chatInput,
    setChatInput,
    sendChat,
    mood,
    setMood,
    stress,
    setStress,
    smallThing,
    setSmallThing,
    divinations,
    saveDivination,
    journals,
    saveJournal,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
