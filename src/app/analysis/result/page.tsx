import Link from "next/link";
import AnchorChart from "@/components/AnchorChart";
import { ANCHOR_INFO, ANCHOR_TYPES, type AnchorScores, type AnchorType } from "@/lib/analysis/anchors";
import { createClient } from "@/lib/supabase/server";

export default async function AnalysisResultPage() {
  const supabase = await createClient();
  const { data: result } = await supabase
    .from("career_anchor_results")
    .select("anchor_scores, dominant_type")
    .maybeSingle();

  if (!result) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-base text-zinc-600 dark:text-zinc-400">診断結果がまだありません。</p>
        <Link
          href="/analysis/anchor"
          className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          診断を始める
        </Link>
      </main>
    );
  }

  const dominant = (
    ANCHOR_TYPES.includes(result.dominant_type as AnchorType) ? result.dominant_type : "specialty"
  ) as AnchorType;
  const info = ANCHOR_INFO[dominant];
  const scores = result.anchor_scores as AnchorScores;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-4 py-10">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">診断結果</p>
        <h1 className="text-2xl font-bold sm:text-3xl">
          あなたは「{info.title}」
        </h1>
        <p className="mx-auto max-w-md text-left text-base leading-8 text-zinc-700 dark:text-zinc-300">
          {info.description}
        </p>
      </div>

      <section className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">8タイプのスコア</h2>
        <AnchorChart scores={scores} dominant={dominant} />
      </section>

      <p className="text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        この行動タイプは、この後のシミュレーションであなたに合った事象を考えるヒントとして使われます。
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/simulation"
          className="rounded-full bg-blue-600 px-8 py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          シミュレーションへ進む
        </Link>
        <Link
          href="/home"
          className="text-center text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}
