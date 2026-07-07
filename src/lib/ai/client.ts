import type { GeneratedEvent, Phase } from "@/lib/types";
import { generateEventsWithOpenAI, type GenerationContext } from "./openai";

export type { GenerationContext };

export interface EventGenerator {
  generateEvents(phase: Phase, context: GenerationContext): Promise<GeneratedEvent[]>;
}

// プロバイダを差し替える場合はここで実装を切り替える
export function getEventGenerator(): EventGenerator {
  return { generateEvents: generateEventsWithOpenAI };
}
