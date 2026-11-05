import type { Bookmark, BookmarkStore, PageId } from "./types";

export const BOOKMARK_KEY = "devops-kg-bookmark";

export const DEFAULT_BOOKMARK: Bookmark = {
  page: "lang",
  primary: "go",
  topic: "chan",
  label: "①语言层 · Golang · channel / select",
  updatedAt: "初始",
};

function isPageId(v: unknown): v is PageId {
  return v === "overview" || v === "lang" || v === "mid" || v === "scene";
}

function looksLikeBookmark(v: unknown): v is Bookmark {
  if (!v || typeof v !== "object") return false;
  const b = v as Record<string, unknown>;
  return (
    isPageId(b.page) &&
    typeof b.primary === "string" &&
    typeof b.topic === "string" &&
    typeof b.label === "string"
  );
}

/** Migrate v1 flat Bookmark → v2 store. */
export function migrateToV2(raw: unknown): BookmarkStore | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  if (obj.version === 2 && looksLikeBookmark(obj.current)) {
    const byPage: Partial<Record<PageId, Bookmark>> = {};
    const src = (obj.byPage ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(src)) {
      if (isPageId(key) && looksLikeBookmark(src[key])) {
        byPage[key] = src[key] as Bookmark;
      }
    }
    // ensure current page has an entry
    byPage[obj.current.page] = byPage[obj.current.page] ?? obj.current;
    return { version: 2, current: obj.current, byPage };
  }

  // v1 flat bookmark (no version field, or version !== 2)
  if (looksLikeBookmark(obj) && (obj as { version?: unknown }).version !== 2) {
    const current: Bookmark = {
      page: obj.page,
      primary: obj.primary,
      topic: obj.topic,
      label: obj.label,
      updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : "迁移",
    };
    return {
      version: 2,
      current,
      byPage: { [current.page]: current },
    };
  }

  return null;
}

export function readStore(): BookmarkStore | null {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
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
export function writeBookmark(b: Bookmark): void {
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
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(store));
}

export function nowStamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
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
