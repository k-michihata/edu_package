import { NextResponse } from "next/server";
import { getEventGenerator } from "@/lib/ai/client";
import type { Phase } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phase = (body as { phase?: unknown } | null)?.phase;

  if (phase !== "first" && phase !== "second") {
    return NextResponse.json({ error: "phase には first または second を指定してください" }, { status: 400 });
  }

  try {
    const events = await getEventGenerator().generateEvents(phase as Phase);
    if (events.length === 0) {
      return NextResponse.json({ error: "事象を生成できませんでした" }, { status: 502 });
    }
    return NextResponse.json({
      events: events.map((e) => ({ ...e, event_id: crypto.randomUUID() })),
    });
  } catch (error) {
    console.error("event generation failed:", error);
    return NextResponse.json({ error: "事象の生成に失敗しました。もう一度お試しください。" }, { status: 500 });
  }
}
