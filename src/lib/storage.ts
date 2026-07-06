import type { Answer } from "@/lib/types";

const STORAGE_KEY = "life-graph-answers";

export function saveAnswers(answers: Answer[]): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function loadAnswers(): Answer[] | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Answer[]) : null;
  } catch {
    return null;
  }
}

export function clearAnswers(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
