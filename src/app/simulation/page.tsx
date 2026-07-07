"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import type { Evaluation, Phase } from "@/lib/types";

interface EventItem {
  event_id: string;
  age_at_event: number;
  description: string;
  answered: boolean;
}

const PHASE_LABEL: Record<Phase, string> = {
  first: "前半（10〜40代）",
  second: "後半（50〜80代）",
};

export default function SimulationPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("first");
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [index, setIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [actionText, setActionText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPhase = useCallback(
    async (target: Phase) => {
      setPhase(target);
      setEvents(null);
      setError(null);
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: target }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.events) {
          throw new Error(data?.error ?? "事象の生成に失敗しました。もう一度お試しください。");
        }
        if (data.needsInput) {
          // このフェーズの生徒入力がまだ → 事象入力画面へ
          router.replace(`/simulation/input?phase=${target}`);
          return;
        }
        const items: EventItem[] = data.events;
        const firstUnanswered = items.findIndex((e) => !e.answered);
        if (firstUnanswered === -1) {
          // このフェーズは回答済み。次のフェーズか結果へ
          if (target === "first") {
            await loadPhase("second");
          } else {
            router.replace("/result");
          }
          return;
        }
        setEvents(items);
        setIndex(firstUnanswered);
      } catch (e) {
        setError(e instanceof Error ? e.message : "通信に失敗しました。もう一度お試しください。");
      }
    },
    [router],
  );

  useEffect(() => {
    loadPhase("first");
  }, [loadPhase]);

  const handleNext = async () => {
    if (!events || evaluation === null || saving) return;
    const current = events[index];
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: current.event_id,
          phase,
          evaluation,
          action_text: actionText,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "回答の保存に失敗しました。もう一度お試しください。");
      }
      setEvaluation(null);
      setActionText("");
      if (index + 1 < events.length) {
        setIndex(index + 1);
      } else if (phase === "first") {
        await loadPhase("second");
      } else {
        router.push("/result");
      }
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "保存に失敗しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">{error}</p>
        <button
          type="button"
          onClick={() => loadPhase(phase)}
          className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          もう一度試す
        </button>
      </main>
    );
  }

  if (!events) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400"
          role="status"
          aria-label="読み込み中"
        />
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          AIが{PHASE_LABEL[phase]}の出来事を考えています…
        </p>
      </main>
    );
  }

  const current = events[index];
  const isLast = phase === "second" && index + 1 === events.length;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>{PHASE_LABEL[phase]}</span>
        <span>
          {index + 1} / {events.length}
        </span>
      </div>

      <EventCard
        age={current.age_at_event}
        description={current.description}
        evaluation={evaluation}
        actionText={actionText}
        onChangeEvaluation={setEvaluation}
        onChangeActionText={setActionText}
      />

      <button
        type="button"
        onClick={handleNext}
        disabled={evaluation === null || saving}
        className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "保存中…" : isLast ? "人生グラフを見る" : "次へ"}
      </button>
      {saveError && (
        <p className="text-center text-sm text-red-600 dark:text-red-400">{saveError}</p>
      )}
      {evaluation === null && !saveError && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          ポジティブかネガティブかを選ぶと次に進めます
        </p>
      )}
    </main>
  );
}
