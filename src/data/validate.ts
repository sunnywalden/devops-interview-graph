import type { SegmentGroup } from "../types";
import { languageGroups } from "./language";
import { middlewareGroups } from "./middleware";
import { scenarioGroups } from "./scenarios";

function assertDefaults(name: string, groups: SegmentGroup[]): void {
  for (const g of groups) {
    const ok = g.cards.some((c) => c.id === g.defaultTopic);
    if (!ok) {
      const msg = `[data] ${name} group "${g.id}" defaultTopic "${g.defaultTopic}" not in cards`;
      if (import.meta.env.DEV) {
        throw new Error(msg);
      }
      console.error(msg);
    }
  }
}

export function validateData(): void {
  assertDefaults("language", languageGroups);
  assertDefaults("middleware", middlewareGroups);
  assertDefaults("scenarios", scenarioGroups);
}
