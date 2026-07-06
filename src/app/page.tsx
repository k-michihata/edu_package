import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-400">
          将来可能性教育支援ツール
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          人生グラフシミュレーション
        </h1>
        <p className="mx-auto max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
          AIが生成する「将来起こるかもしれない出来事」に、あなたならどう感じてどう動くかを考えてみよう。
          最後に、あなたの答えが1本の人生グラフになります。
        </p>
      </div>
      <Link
        href="/simulation"
        className="rounded-full bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        シミュレーションを始める
      </Link>
      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        ログイン不要・結果はこのブラウザの中だけに保存されます
      </p>
    </main>
  );
}
