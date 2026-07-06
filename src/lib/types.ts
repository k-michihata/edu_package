export type Phase = "first" | "second";

export interface GeneratedEvent {
  age_at_event: number;
  description: string;
}

export type Evaluation = "positive" | "negative";

export interface Answer {
  event_id: string;
  age_at_event: number;
  description: string;
  evaluation: Evaluation;
  action_text: string;
}
