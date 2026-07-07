export type Phase = "first" | "second";

// 生徒の現在年齢の仮定値（「●年後」→年齢の換算に使う）
export const BASE_AGE = 16;

export type EventCategory = "social_change" | "life_event" | "other";

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  social_change: "社会変化",
  life_event: "ライフイベント",
  other: "その他",
};

export interface UserEventInput {
  category: EventCategory;
  years_later: number;
  age_at_event: number;
  description: string;
}

export interface GeneratedEvent {
  age_at_event: number;
  description: string;
  category: EventCategory;
  source: "ai" | "user_input";
  basis: string;
}

export type Evaluation = "positive" | "negative";

export interface Answer {
  event_id: string;
  age_at_event: number;
  description: string;
  evaluation: Evaluation;
  action_text: string;
}
