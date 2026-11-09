import { readStorage, writeStorage } from "./storage";

/** UI prefs (diagram / focus / layer visit) — independent of bookmark v2. */
export const UI_PREFS_KEY = "devops-kg-ui-prefs";

export type DiagramTab = "mermaid" | "flow";

export type LayerPageId = "lang" | "mid" | "scene";

export type UiPrefs = {
  locale?: "zh" | "en";
  /** Diagram panel expanded. Default false when unset. */
  diagramExpanded?: boolean;
  /** Last active diagram tab when both kinds exist. */
  diagramTab?: DiagramTab;
  /** Oral focus mode: hide chrome for reading. Default false. */
  focusMode?: boolean;
  overviewStar?: string;
  overviewPlan?: "3d" | "5d";
  /**
   * Card ids visited per layer page (weak progress).
   * Keys are layer page ids only; unknown keys ignored on read.
   */
  visitedByPage?: Partial<Record<LayerPageId, string[]>>;
};

const LAYER_PAGES: LayerPageId[] = ["lang", "mid", "scene"];

function isLayerPage(v: unknown): v is LayerPageId {
  return v === "lang" || v === "mid" || v === "scene";
}

function parseVisited(
  raw: unknown,
): Partial<Record<LayerPageId, string[]>> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Partial<Record<LayerPageId, string[]>> = {};
  let any = false;
  for (const key of LAYER_PAGES) {
    const val = (raw as Record<string, unknown>)[key];
    if (!Array.isArray(val)) continue;
    const ids = val.filter((x): x is string => typeof x === "string");
    if (ids.length) {
      out[key] = [...new Set(ids)];
      any = true;
    }
  }
  return any ? out : undefined;
}

export function readUiPrefs(raw = readStorage(UI_PREFS_KEY)): UiPrefs {
  try {
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const o = parsed as Record<string, unknown>;
    const out: UiPrefs = {};
    if (o.locale === "zh" || o.locale === "en") out.locale = o.locale;
    if (typeof o.diagramExpanded === "boolean") {
      out.diagramExpanded = o.diagramExpanded;
    }
    if (o.diagramTab === "mermaid" || o.diagramTab === "flow") {
      out.diagramTab = o.diagramTab;
    }
    if (typeof o.focusMode === "boolean") {
      out.focusMode = o.focusMode;
    }
    if (typeof o.overviewStar === "string") out.overviewStar = o.overviewStar;
    if (o.overviewPlan === "3d" || o.overviewPlan === "5d") out.overviewPlan = o.overviewPlan;
    const visited = parseVisited(o.visitedByPage);
    if (visited) out.visitedByPage = visited;
    return out;
  } catch {
    return {};
  }
}

export function writeUiPrefs(patch: Partial<UiPrefs>): boolean {
  const prev = readUiPrefs();
  const next: UiPrefs = { ...prev, ...patch };
  if (patch.visitedByPage) {
    next.visitedByPage = {
      ...prev.visitedByPage,
      ...patch.visitedByPage,
    };
  }
  return writeStorage(UI_PREFS_KEY, JSON.stringify(next));
}

/** Mark a card visited on a layer page; returns updated id list for that page. */
export function markCardVisited(
  page: LayerPageId,
  cardId: string,
): string[] {
  const prefs = readUiPrefs();
  const prev = prefs.visitedByPage?.[page] ?? [];
  if (prev.includes(cardId)) return prev;
  const next = [...prev, cardId];
  writeUiPrefs({
    visitedByPage: {
      ...prefs.visitedByPage,
      [page]: next,
    },
  });
  return next;
}

export function readVisitedForPage(page: LayerPageId): string[] {
  return readUiPrefs().visitedByPage?.[page] ?? [];
}

export function isLayerPageId(page: string): page is LayerPageId {
  return isLayerPage(page);
}
