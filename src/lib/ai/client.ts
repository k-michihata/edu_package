import type { GeneratedEvent, Phase } from "@/lib/types";
import { generateEventsWithOpenAI } from "./openai";

export interface EventGenerator {
  generateEvents(phase: Phase): Promise<GeneratedEvent[]>;
}

// プロバイダを差し替える場合はここで実装を切り替える
export function getEventGenerator(): EventGenerator {
  return { generateEvents: generateEventsWithOpenAI };
}
