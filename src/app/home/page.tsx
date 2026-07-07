import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Phase } from "@/lib/types";

interface Step {
  label: string;
  status: "done" | "current" | "todo" | "planned";
}

function stepBadge(status: Step["status"]) {
  switch (status) {
    case "done":
      return <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">完了</span>;
    case "current":
      return <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">進行中</span>;
    case "todo":
      return <span className="text-sm text-zinc-400">未着手</span>;
    case "planned":
      return <span className="text-sm text-zinc-400">準備中</span>;
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: events }, { data: answers }, { data: values }, { data: anchor }] =
    await Promise.all([
      supabase.from("profiles").select("name, role").eq("id", user!.id).single(),
      supabase.from("ai_events").select("id, phase"),
      supabase.from("simulation_answers").select("event_id, phase"),
      supabase.from("value_descriptions").select("id"),
      supabase.from("career_anchor_results").select("id").maybeSingle(),
    ]);

  const phaseState = (phase: Phase) => {
    const eventCount = events?.filter((e) => e.phase === phase).length ?? 0;
    const answerCount = answers?.filter((a) => a.phase === phase).length ?? 0;
    return {
      started: eventCount > 0,
      done: eventCount > 0 && answerCount >= eventCount,
    };
  };

  const first = phaseState("first");
  const second = phaseState("second");
  const allDone = first.done && second.done;

  const valuesStarted = (values?.length ?? 0) > 0;
  const analysisDone = anchor !== null;

  const steps: Step[] = [
    {
      label: "自己分析（価値観・行動タイプ診断）",
      status: analysisDone ? "done" : valuesStarted ? "current" : "todo",
    },
    {
      label: "シミュレーション前半（10〜40代）",
      status: first.done ? "done" : first.started ? "current" : "todo",
    },
    {
      label: "シミュレーション後半（50〜80代）",
      status: second.done ? "done" : second.started ? "current" : "todo",
    },
    { label: "人生グラフ", status: allDone ? "done" : "todo" },
  ];

  const ctaHref = allDone
    ? "/result"
    : !analysisDone
      ? valuesStarted
        ? "/analysis/anchor"
        : "/analysis/values"
      : "/simulation";
  const ctaLabel = allDone
    ? "人生グラフを見る"
    : !analysisDone
      ? valuesStarted
        ? "続きから再開する（行動タイプ診断）"
        : "自己分析から始める"
      : first.started || second.started
        ? "続きから再開する"
        : "シミュレーションを始める";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-4 py-10">
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {profile?.name ? `${profile.name} さん` : "ようこそ"}
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl">ホーム</h1>
      </div>

      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-4 dark:border-zinc-800"
          >
            <span
              className={`text-base ${step.status === "planned" ? "text-zinc-400" : ""}`}
            >
              {i + 1}. {step.label}
            </span>
            {stepBadge(step.status)}
          </li>
        ))}
      </ol>

      <Link
        href={ctaHref}
        className="rounded-full bg-blue-600 px-8 py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-blue-700"
      >
        {ctaLabel}
      </Link>

      {allDone && (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          シミュレーションは完了しています。グラフを見て振り返りをしましょう。
        </p>
      )}
    </main>
  );
}
