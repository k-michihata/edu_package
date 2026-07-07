import OpenAI from "openai";
import { ANCHOR_INFO, type AnchorType } from "@/lib/analysis/anchors";
import {
  BASE_AGE,
  CATEGORY_LABELS,
  type EventCategory,
  type GeneratedEvent,
  type Phase,
  type UserEventInput,
} from "@/lib/types";

const EVENT_COUNT = 5;

const PHASE_SPEC: Record<Phase, { label: string; min: number; max: number }> = {
  first: { label: "10代〜40代", min: BASE_AGE, max: 49 },
  second: { label: "50代〜80代", min: 50, max: 89 },
};

export interface GenerationContext {
  dominantType: AnchorType | null;
  userEvents: UserEventInput[];
}

function buildPrompt(phase: Phase, context: GenerationContext): string {
  const { label, min, max } = PHASE_SPEC[phase];
  const anchor = context.dominantType ? ANCHOR_INFO[context.dominantType] : null;

  const anchorSection = anchor
    ? `この生徒の行動タイプ: ${anchor.label}（${anchor.title}）
${anchor.description}`
    : "この生徒の行動タイプ: 未診断";

  const userEventsSection =
    context.userEvents.length > 0
      ? context.userEvents
          .map(
            (e, i) =>
              `${i + 1}. [${CATEGORY_LABELS[e.category]}] ${e.age_at_event}歳ごろ: ${e.description}`,
          )
          .join("\n")
      : "（入力なし）";

  return `あなたは日本の高校生向けキャリア教育ツールの事象生成AIです。
現在${BASE_AGE}歳の高校生1人に、${label}（${min}〜${max}歳）の間に起こりうる出来事を合計${EVENT_COUNT}個提示します。

${anchorSection}

生徒が自分で考えた将来の事象:
${userEventsSection}

条件:
- 生徒が考えた事象から最低1個・最大2個を採用する。表現を整えてもよいが趣旨は変えない。採用したものは source を "user_input" とし、年齢は生徒の想定に合わせる
- 残りはあなたが新しく生成し、source を "ai" とする
- 行動タイプに合わせて、この生徒に響きそうな事象の種類や優先順位を調整する（例: 挑戦タイプには転機や大きな決断、安定タイプには生活基盤に関わる事象を多めに）
- 日本で暮らす平均的な人に起こりうるライフイベントと社会変化、ポジティブとネガティブを混在させる
- ${EVENT_COUNT}個の年齢は${min}〜${max}歳の範囲で偏りなくばらけさせる
- description は高校生にも分かる平易な日本語で1〜2文にする
- basis にはその事象を選んだ・作った理由を短く書く（例: 「生徒入力から採用」「行動タイプ（挑戦）に合わせて生成」）

次のJSON形式のみで出力してください。余分なテキストは含めないでください。
{"events": [{"age_at_event": 22, "description": "大学を卒業し、就職活動を経て社会人になる", "category": "life_event", "source": "ai", "basis": "平均的なライフイベント"}]}`;
}

const CATEGORIES: EventCategory[] = ["social_change", "life_event", "other"];

function isValidEvent(value: unknown): value is GeneratedEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.age_at_event === "number" && typeof v.description === "string" && v.description.length > 0;
}

function normalize(event: GeneratedEvent): GeneratedEvent {
  return {
    age_at_event: Math.round(event.age_at_event),
    description: event.description,
    category: CATEGORIES.includes(event.category) ? event.category : "other",
    source: event.source === "user_input" ? "user_input" : "ai",
    basis: typeof event.basis === "string" ? event.basis : "",
  };
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
      const events = list.filter(isValidEvent).map(normalize);
      if (events.length > 0) return events;
    }
  }

  throw new Error("AI応答のJSONパースに失敗しました");
}

// 生徒入力が1つも採用されていなければ、先頭の生徒入力でAI事象を1つ差し替える（F-22の保証）
export function ensureUserEventIncluded(
  events: GeneratedEvent[],
  userEvents: UserEventInput[],
): GeneratedEvent[] {
  if (userEvents.length === 0 || events.some((e) => e.source === "user_input")) {
    return events;
  }
  const adopted: GeneratedEvent = {
    age_at_event: userEvents[0].age_at_event,
    description: userEvents[0].description,
    category: userEvents[0].category,
    source: "user_input",
    basis: "生徒入力から採用",
  };
  return [...events.slice(0, -1), adopted];
}

export async function generateEventsWithOpenAI(
  phase: Phase,
  context: GenerationContext,
): Promise<GeneratedEvent[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY が設定されていません（.env.local を確認してください）");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: buildPrompt(phase, context) }],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content ?? "";
  const { min, max } = PHASE_SPEC[phase];
  const events = parseEvents(text)
    .filter((e) => e.age_at_event >= min && e.age_at_event <= max)
    .slice(0, EVENT_COUNT);

  return ensureUserEventIncluded(events, context.userEvents).sort(
    (a, b) => a.age_at_event - b.age_at_event,
  );
}
