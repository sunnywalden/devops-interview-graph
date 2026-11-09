import type { ContentSourceId } from "./data/sources";

export type PageId = "overview" | "lang" | "mid" | "scene";

export type Bookmark = {
  page: PageId;
  primary: string;
  topic: string;
  label: string;
  updatedAt: string;
};

/** v2 localStorage shape: last-active + per-page restore. */
export type BookmarkStore = {
  version: 2;
  current: Bookmark;
  byPage: Partial<Record<PageId, Bookmark>>;
};

export type FollowUp = { q: string; a: string };

export type FlowNode = {
  id: string;
  label: string;
  detail?: string;
  /** Optional fixed layout; otherwise auto-grid. */
  x?: number;
  y?: number;
};

export type FlowEdge = {
  from: string;
  to: string;
  label?: string;
};

export type CardVisual =
  | { kind: "mermaid"; title: string; source: string }
  | {
      kind: "flow";
      title: string;
      nodes: FlowNode[];
      edges: FlowEdge[];
    };

export type Card = {
  id: string;
  label: string;
  oneLiner: string;
  resumeAnchor: string;
  principles: string[];
  pitfalls: string[];
  oral: string;
  followUps: FollowUp[];
  /** Primary references; these do not verify the reader's project experience. */
  sources: ContentSourceId[];
  scope?: string;
  warning?: string;
  /** Mermaid diagrams and/or interactive React Flow graphs. */
  visuals?: CardVisual[];
};

export type SegmentGroup = {
  id: string;
  label: string;
  defaultTopic: string;
  cards: Card[];
};

export type StarStory = {
  id: string;
  label: string;
  role: string;
  layerMap: string;
  s: string;
  t: string;
  a: string;
  r: string;
  followUp: string;
  evidence: string;
};

export type SprintDay = {
  label: string;
  items: { label: string; value: string }[];
};
