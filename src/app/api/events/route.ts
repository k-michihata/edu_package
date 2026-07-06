import { NextResponse } from "next/server";
import { getEventGenerator } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import type { Phase } from "@/lib/types";

// 指定フェーズの事象を返す。未生成ならAIで生成してDBに保存する（再開時は既存分を返す）
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phase = (body as { phase?: unknown } | null)?.phase;

  if (phase !== "first" && phase !== "second") {
    return NextResponse.json({ error: "phase には first または second を指定してください" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  try {
    let { data: rows } = await supabase
      .from("ai_events")
      .select("id, age_at_event, description")
      .eq("phase", phase)
      .order("age_at_event");

    if (!rows || rows.length === 0) {
      const generated = await getEventGenerator().generateEvents(phase as Phase);
      if (generated.length === 0) {
        return NextResponse.json({ error: "事象を生成できませんでした" }, { status: 502 });
      }
      const { data: inserted, error: insertError } = await supabase
        .from("ai_events")
        .insert(
          generated.map((e) => ({
            user_id: user.id,
            phase,
            source: "ai",
            age_at_event: e.age_at_event,
            description: e.description,
          })),
        )
        .select("id, age_at_event, description");
      if (insertError) throw insertError;
      rows = inserted;
    }

    const { data: answered } = await supabase
      .from("simulation_answers")
      .select("event_id")
      .eq("phase", phase);
    const answeredIds = new Set((answered ?? []).map((a) => a.event_id));

    return NextResponse.json({
      events: (rows ?? []).map((e) => ({
        event_id: e.id,
        age_at_event: e.age_at_event,
        description: e.description,
        answered: answeredIds.has(e.id),
      })),
    });
  } catch (error) {
    console.error("event generation failed:", error);
    return NextResponse.json({ error: "事象の生成に失敗しました。もう一度お試しください。" }, { status: 500 });
  }
}
