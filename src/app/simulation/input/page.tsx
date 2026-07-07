"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BASE_AGE,
  CATEGORY_LABELS,
  type EventCategory,
  type Phase,
} from "@/lib/types";

const PHASE_INFO: Record<Phase, { label: string; minYears: number; maxYears: number }> = {
  first: { label: "前半（10〜40代）", minYears: 1, maxYears: 49 - BASE_AGE },
  second: { label: "後半（50〜80代）", minYears: 50 - BASE_AGE, maxYears: 89 - BASE_AGE },
};

const MIN_EVENTS = 3;
const MAX_EVENTS = 5;

interface EventRow {
  category: EventCategory;
  years_later: string;
  description: string;
}

const emptyRow = (): EventRow => ({ category: "life_event", years_later: "", description: "" });

function InputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phase: Phase = searchParams.get("phase") === "second" ? "second" : "first";
  const info = PHASE_INFO[phase];

  const [rows, setRows] = useState<EventRow[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      // 生成済みなら入力はもう変えられないのでシミュレーションへ
      const { data: generated } = await supabase.from("ai_events").select("id").eq("phase", phase).limit(1);
      if (generated && generated.length > 0) {
        router.replace("/simulation");
        return;
      }
      const { data: existing } = await supabase
        .from("user_events")
        .select("category, years_later, description")
        .eq("phase", phase)
        .order("years_later");
      if (existing && existing.length > 0) {
        setRows(
          existing.map((e) => ({
            category: e.category as EventCategory,
            years_later: String(e.years_later),
            description: e.description,
          })),
        );
      }
      setLoading(false);
    };
    load();
  }, [phase, router]);

  const updateRow = (i: number, patch: Partial<EventRow>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const rowValid = (r: EventRow) => {
    const years = Number(r.years_later);
    return (
      r.description.trim().length > 0 &&
      Number.isFinite(years) &&
      years >= info.minYears &&
      years <= info.maxYears
    );
  };

  const filledRows = rows.filter((r) => r.years_later !== "" || r.description.trim() !== "");
  const allValid = filledRows.length >= MIN_EVENTS && filledRows.every(rowValid);

  const handleSave = async () => {
    if (!allValid || saving) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }

    // 入力し直しに対応するため、このフェーズの既存入力を入れ替える
    const { error: deleteError } = await supabase.from("user_events").delete().eq("phase", phase);
    const { error: insertError } = deleteError
      ? { error: deleteError }
      : await supabase.from("user_events").insert(
          filledRows.map((r) => ({
            user_id: user.id,
            phase,
            category: r.category,
            years_later: Number(r.years_later),
            age_at_event: BASE_AGE + Number(r.years_later),
            description: r.description.trim(),
          })),
        );

    if (insertError) {
      console.error(insertError);
      setError("保存に失敗しました。もう一度お試しください。");
      setSaving(false);
      return;
    }
    router.push("/simulation");
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400"
          role="status"
          aria-label="読み込み中"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
          将来事象の入力 ・ {info.label}
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">
          未来に起こりそうなことを考えてみよう
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          「●年後に○○が起こる」の形で{MIN_EVENTS}〜{MAX_EVENTS}個入力してね（{info.minYears}〜
          {info.maxYears}年後 ＝ {BASE_AGE + info.minYears}〜{BASE_AGE + info.maxYears}
          歳ごろ）。時期が偏らないようにばらけさせるのがコツ。
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row, i) => {
          const years = Number(row.years_later);
          const showAge = row.years_later !== "" && Number.isFinite(years);
          const outOfRange = showAge && (years < info.minYears || years > info.maxYears);
          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{i + 1}.</span>
                <select
                  value={row.category}
                  onChange={(e) => updateRow(i, { category: e.target.value as EventCategory })}
                  className="rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-sm">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={info.minYears}
                    max={info.maxYears}
                    value={row.years_later}
                    onChange={(e) => updateRow(i, { years_later: e.target.value })}
                    className="w-16 rounded-lg border border-zinc-300 bg-transparent px-2 py-1.5 text-center focus:border-blue-500 focus:outline-none dark:border-zinc-700"
                  />
                  <span>年後</span>
                  {showAge && !outOfRange && (
                    <span className="text-zinc-500 dark:text-zinc-400">（{BASE_AGE + years}歳ごろ）</span>
                  )}
                  {outOfRange && (
                    <span className="text-red-600 dark:text-red-400">
                      {info.minYears}〜{info.maxYears}で入力してね
                    </span>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={row.description}
                onChange={(e) => updateRow(i, { description: e.target.value })}
                placeholder="例：AIが多くの仕事を手伝うようになって働き方が変わる"
                className="w-full rounded-xl border border-zinc-300 bg-transparent p-3 text-base focus:border-blue-500 focus:outline-none dark:border-zinc-700"
              />
            </div>
          );
        })}
      </div>

      {rows.length < MAX_EVENTS && (
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="mx-auto text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
        >
          ＋ もう1個追加する（最大{MAX_EVENTS}個）
        </button>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!allValid || saving}
        className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "保存中…" : "この内容でシミュレーションへ"}
      </button>
      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!allValid && !error && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {MIN_EVENTS}個以上、年数と内容がそろったら進めます
        </p>
      )}
    </main>
  );
}

export default function EventInputPage() {
  return (
    <Suspense>
      <InputContent />
    </Suspense>
  );
}
