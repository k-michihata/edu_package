import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { event_id, phase, evaluation, action_text } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof event_id !== "string" ||
    (phase !== "first" && phase !== "second") ||
    (evaluation !== "positive" && evaluation !== "negative") ||
    typeof action_text !== "string"
  ) {
    return NextResponse.json({ error: "回答の形式が正しくありません" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { error } = await supabase.from("simulation_answers").upsert(
    {
      user_id: user.id,
      event_id,
      phase,
      evaluation,
      action_text: action_text.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,event_id" },
  );

  if (error) {
    console.error("answer save failed:", error);
    return NextResponse.json({ error: "回答の保存に失敗しました。もう一度お試しください。" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
