"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_VALUE_QUESTIONS } from "@/lib/analysis/questions";

export default function ValuesPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [existingIds, setExistingIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("value_descriptions")
        .select("id, question_id, answer")
        .in(
          "question_id",
          DEFAULT_VALUE_QUESTIONS.map((q) => q.id),
        );
      const initial: Record<string, string> = {};
      const ids: Record<string, string> = {};
      for (const row of data ?? []) {
        if (row.question_id) {
          initial[row.question_id] = row.answer;
          ids[row.question_id] = row.id;
        }
      }
      setAnswers(initial);
      setExistingIds(ids);
      setLoading(false);
    };
    load();
  }, []);

  const allFilled = DEFAULT_VALUE_QUESTIONS.every((q) => (answers[q.id] ?? "").trim().length > 0);

  const handleSave = async () => {
    if (!allFilled || saving) return;
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

    for (const q of DEFAULT_VALUE_QUESTIONS) {
      const answer = (answers[q.id] ?? "").trim();
      const existingId = existingIds[q.id];
      const { error: saveError } = existingId
        ? await supabase
            .from("value_descriptions")
            .update({ answer, updated_at: new Date().toISOString() })
            .eq("id", existingId)
        : await supabase
            .from("value_descriptions")
            .insert({ user_id: user.id, question_id: q.id, answer });
      if (saveError) {
        console.error(saveError);
        setError("保存に失敗しました。もう一度お試しください。");
        setSaving(false);
        return;
      }
    }
    router.push("/analysis/anchor");
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
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">自己分析 1/2</p>
        <h1 className="text-2xl font-bold sm:text-3xl">あなたの価値観を言葉にしてみよう</h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          正解はありません。思いついたことをそのまま書いてOKです。
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {DEFAULT_VALUE_QUESTIONS.map((q, i) => (
          <label
            key={q.id}
            className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="font-medium leading-7">
              Q{i + 1}. {q.text}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{q.hint}</span>
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-300 bg-transparent p-3 text-base leading-7 focus:border-blue-500 focus:outline-none dark:border-zinc-700"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!allFilled || saving}
        className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "保存中…" : "保存して診断へ進む"}
      </button>
      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!allFilled && !error && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          3つとも書けたら次に進めます
        </p>
      )}
    </main>
  );
}
