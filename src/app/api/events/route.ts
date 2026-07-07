import { NextResponse } from "next/server";
import { getEventGenerator } from "@/lib/ai/client";
import type { AnchorType } from "@/lib/analysis/anchors";
import { createClient } from "@/lib/supabase/server";
import type { Phase, UserEventInput } from "@/lib/types";

const MIN_USER_EVENTS = 3;

// 指定フェーズの事象を返す。
// - 生成済み → 既存分を返す（再開）
// - 未生成で生徒入力が3個未満 → needsInput（入力画面へ誘導）
// - 未生成で生徒入力あり → 行動タイプ+生徒入力を使ってAI生成し保存
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
      const [{ data: userEvents }, { data: anchor }] = await Promise.all([
        supabase
          .from("user_events")
          .select("category, years_later, age_at_event, description")
          .eq("phase", phase)
          .order("age_at_event"),
        supabase.from("career_anchor_results").select("dominant_type").maybeSingle(),
      ]);

      if (!userEvents || userEvents.length < MIN_USER_EVENTS) {
        return NextResponse.json({ needsInput: true, events: [] });
      }

      const generated = await getEventGenerator().generateEvents(phase as Phase, {
        dominantType: (anchor?.dominant_type as AnchorType | undefined) ?? null,
        userEvents: userEvents as UserEventInput[],
      });
      if (generated.length === 0) {
        return NextResponse.json({ error: "事象を生成できませんでした" }, { status: 502 });
      }

      const { data: inserted, error: insertError } = await supabase
        .from("ai_events")
        .insert(
          generated.map((e) => ({
            user_id: user.id,
            phase,
            source: e.source,
            category: e.category,
            age_at_event: e.age_at_event,
            description: e.description,
            basis: e.basis,
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
