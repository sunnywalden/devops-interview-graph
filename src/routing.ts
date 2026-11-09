import { languageGroups } from "./data/language";
import { middlewareGroups } from "./data/middleware";
import { scenarioGroups } from "./data/scenarios";
import { starStories } from "./data/overview";
import { DEFAULT_BOOKMARK, parseHash, readStore } from "./bookmark";
import { readUiPrefs, type UiPrefs } from "./uiPrefs";
import type { BookmarkStore, PageId, SegmentGroup } from "./types";

export type Route = { page: PageId; primary: string; topic: string };

export function groupsForPage(page: PageId): SegmentGroup[] | undefined {
  if (page === "lang") return languageGroups;
  if (page === "mid") return middlewareGroups;
  if (page === "scene") return scenarioGroups;
  return undefined;
}

export function overviewSelection(prefs: UiPrefs) {
  return {
    star: starStories.some((story) => story.id === prefs.overviewStar)
      ? prefs.overviewStar! : starStories[0].id,
    plan: prefs.overviewPlan ?? "5d",
  };
}

/** Normalize every entry point before it is displayed or saved. */
export function resolveRoute(
  hash: string,
  store: BookmarkStore | null = readStore(),
  prefs: UiPrefs = readUiPrefs(),
): Route {
  const fromHash = parseHash(hash);
  const current = store?.current ?? DEFAULT_BOOKMARK;
  const requested = fromHash ?? current;
  const page = requested.page;
  const saved = store?.byPage[page];

  if (page === "overview") {
    const primary = requested.primary ?? "home";
    const remembered = overviewSelection(prefs);
    const savedTopic = saved?.primary === primary ? saved.topic : undefined;
    if (primary === "star") {
      const topic = requested.topic ?? savedTopic ?? remembered.star;
      return { page, primary, topic: starStories.some((story) => story.id === topic) ? topic : remembered.star };
    }
    if (primary === "plan") {
      const topic = requested.topic ?? savedTopic ?? remembered.plan;
      return { page, primary, topic: topic === "3d" || topic === "5d" ? topic : remembered.plan };
    }
    return { page, primary: primary === "map" ? "map" : "home", topic: "start" };
  }

  const groups = groupsForPage(page)!;
  // A bare layer link resumes that layer; an explicit group starts its own topic.
  const candidate = requested.primary ? requested : saved ?? requested;
  const group = groups.find((item) => item.id === candidate.primary) ?? groups[0];
  const topic = group.cards.some((card) => card.id === candidate.topic)
    ? candidate.topic! : group.defaultTopic;
  return { page, primary: group.id, topic };
}

export function routeLabel({ page, primary, topic }: Route): string {
  if (page === "overview") {
    if (primary === "star") return `总览 · STAR · ${starStories.find((story) => story.id === topic)?.label ?? "项目表达"}`;
    if (primary === "plan") return `总览 · ${topic === "3d" ? "3" : "5"} 天冲刺`;
    return primary === "map" ? "总览 · 知识图谱" : "学习总览";
  }
  const name = page === "lang" ? "①语言层" : page === "mid" ? "②中间件" : "③场景";
  const group = groupsForPage(page)?.find((item) => item.id === primary);
  const card = group?.cards.find((item) => item.id === topic);
  return group && card ? `${name} · ${group.label} · ${card.label}` : name;
}
