"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const [signingIn, setSigningIn] = useState(false);
  const authError = searchParams.get("error");

  const handleLogin = async () => {
    setSigningIn(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium tracking-wide text-blue-600 dark:text-blue-400">
          将来可能性教育支援ツール
        </p>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">ログイン</h1>
        <p className="mx-auto max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
          学校のGoogleアカウントでログインすると、前回の続きから再開できます。
        </p>
      </div>

      {authError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          ログインに失敗しました。もう一度お試しください。
        </p>
      )}

      <button
        type="button"
        onClick={handleLogin}
        disabled={signingIn}
        className="flex items-center gap-3 rounded-full border border-zinc-300 bg-white px-8 py-4 text-base font-semibold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.9 3C3.2 21.3 7.3 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.1 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-3.9-3C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l3.9-3z"
          />
          <path
            fill="#EA4335"
            d="M12 4.6c2.3 0 3.8 1 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l3.9 3c1-2.9 3.7-5 6.9-5z"
          />
        </svg>
        {signingIn ? "リダイレクト中…" : "Googleでログイン"}
      </button>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
