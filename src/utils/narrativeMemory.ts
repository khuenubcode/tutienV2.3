import { GameHistoryItem } from "../types";

/**
 * Summarizes recent history into a concise string for LLM context.
 */
export function summarizeRecentHistory(history: GameHistoryItem[]): string {
  if (history.length === 0) return "Chưa có hành động nào gần đây.";
  // Take last 5 actions to keep context focused
  const recent = history.slice(-5);
  return recent.map(item => item.story).join(" | ");
}
