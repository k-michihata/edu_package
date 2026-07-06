"use client";

import type { Evaluation } from "@/lib/types";

interface Props {
  age: number;
  description: string;
  evaluation: Evaluation | null;
  actionText: string;
  onChangeEvaluation: (value: Evaluation) => void;
  onChangeActionText: (value: string) => void;
}

export default function EventCard({
  age,
  description,
  evaluation,
  actionText,
  onChangeEvaluation,
  onChangeActionText,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{age}歳のとき</span>
        <p className="text-lg font-medium leading-8">{description}</p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          この出来事をどう感じる？
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangeEvaluation("positive")}
            aria-pressed={evaluation === "positive"}
            className={`rounded-xl border-2 px-4 py-4 text-base font-semibold transition-colors ${
              evaluation === "positive"
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300"
                : "border-zinc-200 text-zinc-600 hover:border-blue-300 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            😊 ポジティブ
          </button>
          <button
            type="button"
            onClick={() => onChangeEvaluation("negative")}
            aria-pressed={evaluation === "negative"}
            className={`rounded-xl border-2 px-4 py-4 text-base font-semibold transition-colors ${
              evaluation === "negative"
                ? "border-red-500 bg-red-50 text-red-700 dark:border-red-400 dark:bg-red-950 dark:text-red-300"
                : "border-zinc-200 text-zinc-600 hover:border-red-300 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            😔 ネガティブ
          </button>
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          あなたならどう行動する？
        </span>
        <textarea
          value={actionText}
          onChange={(e) => onChangeActionText(e.target.value)}
          rows={3}
          placeholder="例：新しい仕事に必要なスキルを勉強してみる"
          className="w-full resize-none rounded-xl border border-zinc-300 bg-transparent p-3 text-base leading-7 focus:border-blue-500 focus:outline-none dark:border-zinc-700"
        />
      </label>
    </div>
  );
}
