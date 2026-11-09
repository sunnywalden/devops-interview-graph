import type { Bookmark, BookmarkStore, PageId } from "./types";
import { readStorage, writeStorage } from "./storage";

export const BOOKMARK_KEY = "devops-kg-bookmark";

export const DEFAULT_BOOKMARK: Bookmark = {
  page: "overview",
  primary: "home",
  topic: "start",
  label: "学习总览",
  updatedAt: "初始",
};

function isPageId(v: unknown): v is PageId {
  return v === "overview" || v === "lang" || v === "mid" || v === "scene";
}

function normalizeBookmark(v: unknown): Bookmark | null {
  if (!v || typeof v !== "object") return null;
  const b = v as Record<string, unknown>;
  if (
    isPageId(b.page) &&
    typeof b.primary === "string" &&
    typeof b.topic === "string" &&
    typeof b.label === "string"
  ) return {
    page: b.page, primary: b.primary, topic: b.topic, label: b.label,
    updatedAt: typeof b.updatedAt === "string" ? b.updatedAt : "迁移",
  };
  return null;
}

/** Migrate v1 flat Bookmark → v2 store. */
export function migrateToV2(raw: unknown): BookmarkStore | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  if (obj.version === 2) {
    const byPage: Partial<Record<PageId, Bookmark>> = {};
    const src = obj.byPage && typeof obj.byPage === "object" ? obj.byPage as Record<string, unknown> : {};
    for (const key of Object.keys(src)) {
      const bookmark = normalizeBookmark(src[key]);
      if (isPageId(key) && bookmark?.page === key) byPage[key] = bookmark;
    }
    const current = normalizeBookmark(obj.current) ?? Object.values(byPage)[0];
    if (!current) return null;
    byPage[current.page] = current;
    return { version: 2, current, byPage };
  }

  // Recognize v1 only; unknown future schemas must not be misinterpreted.
  const current = normalizeBookmark(obj);
  if (current && (obj.version === undefined || obj.version === 1)) {
    return {
      version: 2,
      current,
      byPage: { [current.page]: current },
    };
  }

  return null;
}

export function readStore(raw = readStorage(BOOKMARK_KEY)): BookmarkStore | null {
  try {
    if (!raw) return null;
    return migrateToV2(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Convenience: current bookmark only (null if nothing stored). */
export function readBookmark(): Bookmark | null {
  return readStore()?.current ?? null;
}

/** Per-page bookmark if present. */
export function readPageBookmark(page: PageId): Bookmark | null {
  const store = readStore();
  if (!store) return null;
  return store.byPage[page] ?? null;
}

/** Persist bookmark into both `current` and `byPage[page]`. */
export function writeBookmark(b: Bookmark): boolean {
  const prev = readStore();
  const byPage: Partial<Record<PageId, Bookmark>> = {
    ...(prev?.byPage ?? {}),
    [b.page]: b,
  };
  const store: BookmarkStore = {
    version: 2,
    current: b,
    byPage,
  };
  return writeStorage(BOOKMARK_KEY, JSON.stringify(store));
}

export function nowStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${y}-${m}-${day} ${h}:${min}:${sec}.${ms}`;
}

/** Parse `#/lang/go/chan` → parts. Empty hash → null (use bookmark). */
export function parseHash(hash: string): {
  page: PageId;
  primary?: string;
  topic?: string;
} | null {
  const raw = (hash || "").trim();
  if (!raw || raw === "#" || raw === "#/") return null;
  const h = raw.replace(/^#\/?/, "").trim();
  if (!h) return null;
  const parts = h.split("/").filter(Boolean);
  const page = parts[0] as PageId;
  if (page === "overview" || page === "lang" || page === "mid" || page === "scene") {
    return {
      page,
      primary: parts[1],
      topic: parts[2],
    };
  }
  return null;
}

export function toHash(page: PageId, primary?: string, topic?: string): string {
  if (page === "overview") {
    if (primary && topic) return `#/overview/${primary}/${topic}`;
    if (primary) return `#/overview/${primary}`;
    return "#/overview";
  }
  if (primary && topic) return `#/${page}/${primary}/${topic}`;
  if (primary) return `#/${page}/${primary}`;
  return `#/${page}`;
}
