"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ログイン画面なしで使えるよう、初回クリック時に匿名アカウントを自動作成する
export default function StartButton() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    setError(false);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) {
        console.error(signInError);
        setError(true);
        setStarting(false);
        return;
      }
    }
    router.push("/home");
    router.refresh();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleStart}
        disabled={starting}
        className="rounded-full bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
      >
        {starting ? "準備中…" : "始める"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          開始できませんでした。通信環境を確認してもう一度お試しください。
        </p>
      )}
    </div>
  );
}
