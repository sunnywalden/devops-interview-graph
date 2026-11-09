import { localizedGroups } from "./i18n/content";
import { translate } from "./i18n/ui";
import { readStore, toHash } from "./bookmark";
import { languageGroups } from "./data/language";
import { middlewareGroups } from "./data/middleware";
import { scenarioGroups } from "./data/scenarios";
import { readUiPrefs, type LayerPageId } from "./uiPrefs";

export const studyLayers = [
  { id: "lang" as LayerPageId, title: "语言基础", subtitle: "Golang / Python / Shell", description: "从语言机制出发，把底层原理讲清楚。", groups: languageGroups },
  { id: "mid" as LayerPageId, title: "中间件与容器", subtitle: "数据服务 · 容器 · 可观测性 · CI/CD", description: "串联存储、消息与基础设施，理解系统的取舍。", groups: middlewareGroups },
  { id: "scene" as LayerPageId, title: "场景实战", subtitle: "CI/CD · 可观测性 · CMDB", description: "回到真实项目，练习有依据、有边界的技术表达。", groups: scenarioGroups },
];

function bookmarkTime(value: unknown): number {
  return typeof value === "string" ? Date.parse(value.replace(" ", "T")) || 0 : 0;
}

/** Derive reading counts and a valid resume target from the actual curriculum. */
export function readStudySnapshot(store = readStore(), prefs = readUiPrefs()) {
  const localizedLayers = studyLayers.map(layer => ({
    ...layer, title: translate(prefs.locale ?? "zh", layer.title),
    subtitle: translate(prefs.locale ?? "zh", layer.subtitle),
    description: translate(prefs.locale ?? "zh", layer.description),
    groups: localizedGroups(layer.id, prefs.locale ?? "zh"),
  }));
  const layers = localizedLayers.map((layer) => {
    const cards = layer.groups.flatMap((group) => group.cards);
    const visitedIds = new Set(prefs.visitedByPage?.[layer.id] ?? []);
    return { ...layer, total: cards.length, visited: cards.filter((card) => visitedIds.has(card.id)).length };
  });
  const candidates = Object.values(store?.byPage ?? {})
    .filter((bookmark) => bookmark.page !== "overview")
    .sort((a, b) => bookmarkTime(b.updatedAt) - bookmarkTime(a.updatedAt));
  if (store?.current && store.current.page !== "overview") candidates.unshift(store.current);

  let resumeLayer = localizedLayers[0];
  let resumeGroup = resumeLayer.groups[0];
  let resumeCard = resumeGroup.cards.find((card) => card.id === resumeGroup.defaultTopic) ?? resumeGroup.cards[0];
  let hasBookmark = false;
  for (const bookmark of candidates) {
    const layer = localizedLayers.find((item) => item.id === bookmark.page);
    const group = layer?.groups.find((item) => item.id === bookmark.primary);
    const card = group?.cards.find((item) => item.id === bookmark.topic);
    if (layer && group && card) {
      resumeLayer = layer;
      resumeGroup = group;
      resumeCard = card;
      hasBookmark = true;
      break;
    }
  }
  return {
    layers,
    total: layers.reduce((sum, layer) => sum + layer.total, 0),
    visited: layers.reduce((sum, layer) => sum + layer.visited, 0),
    resume: {
      layer: resumeLayer.title,
      group: resumeGroup.label,
      card: resumeCard,
      href: toHash(resumeLayer.id, resumeGroup.id, resumeCard.id),
      hasBookmark,
    },
  };
}
