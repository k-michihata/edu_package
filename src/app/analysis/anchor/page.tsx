"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ANCHOR_QUESTIONS, SCALE_OPTIONS, calculateScores } from "@/lib/analysis/anchors";

export default function AnchorPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = ANCHOR_QUESTIONS.length;
  const question = ANCHOR_QUESTIONS[index];

  const finish = async (finalAnswers: number[]) => {
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
    const { scores, dominant } = calculateScores(finalAnswers);
    const { error: saveError } = await supabase.from("career_anchor_results").upsert(
      { user_id: user.id, anchor_scores: scores, dominant_type: dominant },
      { onConflict: "user_id" },
    );
    if (saveError) {
      console.error(saveError);
      setError("結果の保存に失敗しました。最後の選択肢をもう一度押してください。");
      setSaving(false);
      setAnswers(finalAnswers.slice(0, -1));
      return;
    }
    router.push("/analysis/result");
  };

  const handleSelect = (value: number) => {
    if (saving) return;
    const next = [...answers.slice(0, index), value];
    setAnswers(next);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      finish(next);
    }
  };

  const handleBack = () => {
    if (index > 0 && !saving) setIndex(index - 1);
  };

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">自己分析 2/2 ・ 行動タイプ診断</p>
        <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>どのくらいあてはまるか選んでね</span>
          <span>
            {index + 1} / {total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <p className="text-lg font-medium leading-8">{question.text}</p>
      </div>

      <div className="flex flex-col gap-2">
        {SCALE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={saving}
            className={`rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-colors disabled:opacity-60 ${
              answers[index] === option.value
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                : "border-zinc-200 text-zinc-700 hover:border-blue-300 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={index === 0 || saving}
          className="text-sm text-zinc-500 underline-offset-4 hover:underline disabled:invisible dark:text-zinc-400"
        >
          ← 前の質問に戻る
        </button>
        {saving && <span className="text-sm text-zinc-500 dark:text-zinc-400">結果を計算中…</span>}
      </div>
      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  );
}
