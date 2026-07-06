import OpenAI from "openai";
import type { GeneratedEvent, Phase } from "@/lib/types";

const EVENT_COUNT = 5;

const PHASE_SPEC: Record<Phase, { label: string; min: number; max: number }> = {
  first: { label: "10代〜40代", min: 16, max: 49 },
  second: { label: "50代〜80代", min: 50, max: 89 },
};

function buildPrompt(phase: Phase): string {
  const { label, min, max } = PHASE_SPEC[phase];
  return `あなたは日本の高校生向けキャリア教育ツールの事象生成AIです。
現在高校生である一人の人物に、${label}（${min}〜${max}歳）の間に起こりうる出来事を${EVENT_COUNT}個生成してください。

条件:
- 日本で暮らす平均的な人に起こりうるライフイベント（進学・就職・結婚・病気など）と社会変化（技術革新・経済変動・災害など）を混在させる
- ポジティブな出来事とネガティブな出来事を混在させる
- ${EVENT_COUNT}個の年齢は${min}〜${max}歳の範囲内で偏りなくばらけさせる
- description は高校生にも分かる平易な日本語で1〜2文にする

次のJSON形式のみで出力してください。余分なテキストは含めないでください。
{"events": [{"age_at_event": 22, "description": "大学を卒業し、就職活動を経て社会人になる"}]}`;
}

function isValidEvent(value: unknown): value is GeneratedEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.age_at_event === "number" && typeof v.description === "string" && v.description.length > 0;
}

// 応答からイベント配列を取り出す。素直なパースに失敗したら
// テキスト中のJSON部分の抽出を試みる（フォールバック）
export function parseEvents(text: string): GeneratedEvent[] {
  const candidates: unknown[] = [];

  try {
    candidates.push(JSON.parse(text));
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        candidates.push(JSON.parse(match[0]));
      } catch {
        // 抽出でも失敗。下の空チェックでエラーにする
      }
    }
  }

  for (const parsed of candidates) {
    const list = Array.isArray(parsed)
      ? parsed
      : (parsed as { events?: unknown })?.events;
    if (Array.isArray(list)) {
      const events = list.filter(isValidEvent);
      if (events.length > 0) return events;
    }
  }

  throw new Error("AI応答のJSONパースに失敗しました");
}

export async function generateEventsWithOpenAI(phase: Phase): Promise<GeneratedEvent[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY が設定されていません（.env.local を確認してください）");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: buildPrompt(phase) }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "";
  const { min, max } = PHASE_SPEC[phase];
  return parseEvents(text)
    .filter((e) => e.age_at_event >= min && e.age_at_event <= max)
    .sort((a, b) => a.age_at_event - b.age_at_event)
    .slice(0, EVENT_COUNT);
}
