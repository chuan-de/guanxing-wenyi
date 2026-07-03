"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Label } from "@/components/ui";
import { api, type DivinationRecordDTO } from "@/lib/api";
import { relativeLabel } from "@/lib/storage";

// 后端不可用时的 mock fallback（与原静态展示一致）
const MOCK = [
  { q: "这段关系，我该继续投入，还是先退一步？", t: "3 天前 · 风山渐 → 风地观", g: "渐" },
  { q: "关于那次面试", t: "上周 · 火天大有", g: "有" },
  { q: "要不要搬去另一座城", t: "两周前 · 风泽中孚", g: "孚" },
];

function sub(r: DivinationRecordDTO): string {
  const when = relativeLabel(r.createdAt);
  if (r.changingTo) return `${when} · ${r.hexName} → ${r.changingTo}`;
  return `${when} · ${r.hexName}`;
}

export default function RecentDivinations() {
  const [rows, setRows] = useState<DivinationRecordDTO[]>([]);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .listDivinations(5)
      .then((data) => {
        if (!alive) return;
        setFromApi(true);
        setRows(data);
      })
      .catch(() => {
        if (alive) setFromApi(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Card style={{ borderRadius: 22, padding: "26px 28px" }}>
      <div className="mb-1.5 flex items-center justify-between">
        <Label>最 近 问 卦</Label>
        <Link href="/app/ask" style={{ fontSize: 12, color: "#3C4A66" }}>去问卦 ›</Link>
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col">
          {rows.slice(0, 3).map((r, i, arr) => (
            <div key={r.id} className="flex items-center justify-between" style={{ padding: "15px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(43,42,40,0.06)" : "none" }}>
              <div className="min-w-0" style={{ marginRight: 16 }}>
                <div style={{ fontSize: 14, color: "#46433C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.question}</div>
                <div style={{ fontSize: 11, color: "#A39C8F", marginTop: 5 }}>{sub(r)}</div>
              </div>
              <span className="font-serif" style={{ fontSize: 13, color: "#7C766B", letterSpacing: 2, flexShrink: 0 }}>{r.hexName.slice(-1)}</span>
            </div>
          ))}
        </div>
      ) : fromApi ? (
        <div style={{ padding: "18px 2px 6px", fontSize: 12.5, color: "#A39C8F", lineHeight: 1.95 }}>
          还没有问过卦。<br />去「问卦」写下心里的事，问一卦，这里会留下足迹。
        </div>
      ) : (
        <div className="flex flex-col">
          {MOCK.map((r, i) => (
            <div key={i} className="flex items-center justify-between" style={{ padding: "15px 0", borderBottom: i < MOCK.length - 1 ? "1px solid rgba(43,42,40,0.06)" : "none" }}>
              <div><div style={{ fontSize: 14, color: "#46433C" }}>{r.q}</div><div style={{ fontSize: 11, color: "#A39C8F", marginTop: 5 }}>{r.t}</div></div>
              <span className="font-serif" style={{ fontSize: 13, color: "#7C766B", letterSpacing: 2, flexShrink: 0, marginLeft: 16 }}>{r.g}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
