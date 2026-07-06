import Link from "next/link";
import LifeGraph from "@/components/LifeGraph";
import { createClient } from "@/lib/supabase/server";
import type { Answer } from "@/lib/types";

export default async function ResultPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("simulation_answers")
    .select("event_id, evaluation, action_text, ai_events(age_at_event, description)")
    .order("created_at");

  const answers: Answer[] = (rows ?? [])
    .flatMap((r) => {
      const event = Array.isArray(r.ai_events) ? r.ai_events[0] : r.ai_events;
      if (!event) return [];
      return [
        {
          event_id: r.event_id,
          age_at_event: event.age_at_event,
          description: event.description,
          evaluation: r.evaluation,
          action_text: r.action_text,
        },
      ];
    })
    .sort((a, b) => a.age_at_event - b.age_at_event);

  if (answers.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          シミュレーションの結果がまだありません。
        </p>
        <Link
          href="/home"
          className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          ホームへ戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">あなたの人生グラフ</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          点にカーソルを合わせる（タップする）と、出来事とあなたの行動が見られます
        </p>
      </div>

      <LifeGraph answers={answers} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">出来事のふりかえり</h2>
        <ul className="flex flex-col gap-3">
          {answers.map((a) => (
            <li
              key={a.event_id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="text-sm font-semibold">
                {a.age_at_event}歳{" "}
                <span
                  className={
                    a.evaluation === "positive"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {a.evaluation === "positive" ? "😊 ポジティブ" : "😔 ネガティブ"}
                </span>
              </p>
              <p className="mt-1 leading-7">{a.description}</p>
              {a.action_text && (
                <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  行動：{a.action_text}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Link
        href="/home"
        className="mx-auto rounded-full border border-zinc-300 px-8 py-3 font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        ホームへ戻る
      </Link>
    </main>
  );
}
