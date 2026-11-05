import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { LayerPage } from "./components/LayerPage";
import { OverviewPage } from "./pages/OverviewPage";
import { languageGroups, languageIntro } from "./data/language";
import { middlewareGroups, middlewareIntro } from "./data/middleware";
import { scenarioGroups, scenarioIntro } from "./data/scenarios";
import { starStories } from "./data/overview";
import type { Bookmark, PageId, SegmentGroup } from "./types";
import {
  DEFAULT_BOOKMARK,
  parseHash,
  readBookmark,
  readPageBookmark,
  readStore,
  toHash,
  writeBookmark,
  nowStamp,
} from "./bookmark";
import { readUiPrefs, writeUiPrefs } from "./uiPrefs";

function findLabel(
  page: PageId,
  primary: string,
  topic: string,
  groups?: SegmentGroup[],
): string {
  if (page === "overview") {
    if (primary === "star") {
      const s = starStories.find((x) => x.id === topic);
      return s ? `总览 · STAR · ${s.label}` : "总览 · STAR";
    }
    if (primary === "plan") {
      return topic === "3d" ? "总览 · 3 天冲刺" : "总览 · 5 天冲刺";
    }
    return "总览";
  }
  const pageName =
    page === "lang" ? "①语言层" : page === "mid" ? "②中间件" : "③场景";
  const g = groups?.find((x) => x.id === primary);
  const c = g?.cards.find((x) => x.id === topic);
  if (g && c) return `${pageName} · ${g.label} · ${c.label}`;
  return pageName;
}

function groupsForPage(p: PageId): SegmentGroup[] | undefined {
  if (p === "lang") return languageGroups;
  if (p === "mid") return middlewareGroups;
  if (p === "scene") return scenarioGroups;
  return undefined;
}

/** Resolve primary/topic for a layer page, preferring per-page bookmark. */
function resolveLayer(
  page: "lang" | "mid" | "scene",
  fromHash: { primary?: string; topic?: string },
): { primary: string; topic: string } {
  const groups = groupsForPage(page)!;
  const pageSaved = readPageBookmark(page);

  let primary = fromHash.primary;
  let topic = fromHash.topic;

  // bare #/mid (no primary/topic) → restore byPage[mid]
  if (!primary) {
    if (pageSaved) {
      primary = pageSaved.primary;
      topic = pageSaved.topic;
    }
  }

  primary = primary || groups[0].id;
  const g = groups.find((x) => x.id === primary) ?? groups[0];
  topic = topic || g.defaultTopic;
  const cardOk = g.cards.some((c) => c.id === topic);
  return {
    primary: g.id,
    topic: cardOk ? topic! : g.defaultTopic,
  };
}

function resolveRoute(): {
  page: PageId;
  primary: string;
  topic: string;
} {
  const fromHash = parseHash(window.location.hash);
  const store = readStore();
  const current = store?.current ?? DEFAULT_BOOKMARK;

  if (fromHash && fromHash.page) {
    if (fromHash.page === "overview") {
      const pageSaved = readPageBookmark("overview");
      const primary =
        fromHash.primary ||
        pageSaved?.primary ||
        (current.page === "overview" ? current.primary : undefined) ||
        "star";
      const topic =
        fromHash.topic ||
        pageSaved?.topic ||
        (current.page === "overview" ? current.topic : undefined) ||
        "mingfu";
      return { page: "overview", primary, topic };
    }
    const resolved = resolveLayer(fromHash.page, fromHash);
    return { page: fromHash.page, ...resolved };
  }

  // no usable hash → current bookmark
  if (current.page === "overview") {
    return {
      page: "overview",
      primary: current.primary || "star",
      topic: current.topic || "mingfu",
    };
  }
  const resolved = resolveLayer(current.page, {
    primary: current.primary,
    topic: current.topic,
  });
  return { page: current.page, ...resolved };
}

export default function App() {
  const initial = useMemo(() => resolveRoute(), []);
  const [page, setPage] = useState<PageId>(initial.page);
  const [primary, setPrimary] = useState(initial.primary);
  const [topic, setTopic] = useState(initial.topic);
  const [bookmark, setBookmark] = useState<Bookmark | null>(
    () => readBookmark(),
  );
  const [focusMode, setFocusMode] = useState(
    () => readUiPrefs().focusMode === true,
  );

  const setFocusModePersist = useCallback((on: boolean) => {
    writeUiPrefs({ focusMode: on });
    setFocusMode(on);
  }, []);

  const persist = useCallback((p: PageId, prim: string, top: string) => {
    const label = findLabel(p, prim, top, groupsForPage(p));
    const b: Bookmark = {
      page: p,
      primary: prim,
      topic: top,
      label,
      updatedAt: nowStamp(),
    };
    writeBookmark(b);
    setBookmark(b);
    const hash = toHash(p, prim, top);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, []);

  // initial sync hash + bookmark (write full deep hash)
  useEffect(() => {
    persist(page, primary, topic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onHash = () => {
      const r = resolveRoute();
      setPage(r.page);
      setPrimary(r.primary);
      setTopic(r.topic);
      // after restore, write full deep hash so refresh is exact
      const label = findLabel(r.page, r.primary, r.topic, groupsForPage(r.page));
      const b: Bookmark = {
        page: r.page,
        primary: r.primary,
        topic: r.topic,
        label,
        updatedAt: nowStamp(),
      };
      writeBookmark(b);
      setBookmark(b);
      const hash = toHash(r.page, r.primary, r.topic);
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Esc exits focus mode
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      // The topic directory handles Escape first and marks the event handled.
      if (document.querySelector("[data-topic-directory]")) return;
      e.preventDefault();
      setFocusModePersist(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, setFocusModePersist]);

  // Sync body class for CSS (print/focus helpers) — layer pages only
  useEffect(() => {
    const on = focusMode && page !== "overview";
    document.body.classList.toggle("focus-mode", on);
    return () => document.body.classList.remove("focus-mode");
  }, [focusMode, page]);

  const onPrimaryChange = (id: string) => {
    const groups = groupsForPage(page);
    if (!groups) return;
    const g = groups.find((x) => x.id === id) ?? groups[0];
    setPrimary(g.id);
    setTopic(g.defaultTopic);
    persist(page, g.id, g.defaultTopic);
  };

  const onTopicChange = (id: string) => {
    setTopic(id);
    persist(page, primary, id);
  };

  const onStar = (id: string) => {
    setPrimary("star");
    setTopic(id);
    persist("overview", "star", id);
  };

  const onPlan = (id: "5d" | "3d") => {
    setPrimary("plan");
    setTopic(id);
    persist("overview", "plan", id);
  };

  /** Jump to the global `current` bookmark with a full deep hash. */
  const onContinue = () => {
    const b = readBookmark() ?? DEFAULT_BOOKMARK;
    const hash = toHash(b.page, b.primary, b.topic);
    window.location.hash = hash;
  };

  const overviewStar =
    page === "overview" && primary === "star" ? topic : "mingfu";
  const overviewPlan =
    page === "overview" &&
    primary === "plan" &&
    (topic === "3d" || topic === "5d")
      ? topic
      : "5d";

  const layerProps = {
    focusMode,
    onFocusMode: setFocusModePersist,
  };

  /** Focus chrome only on layer training pages. */
  const chromeFocus = focusMode && page !== "overview";

  return (
    <Layout
      page={page}
      bookmark={bookmark}
      onContinue={onContinue}
      focusMode={chromeFocus}
      onExitFocus={() => setFocusModePersist(false)}
    >
      {page === "overview" && (
        <OverviewPage
          star={overviewStar}
          plan={overviewPlan}
          onStar={onStar}
          onPlan={onPlan}
        />
      )}
      {page === "lang" && (
        <LayerPage
          page="lang"
          title="①语言层 · Golang / Python"
          intro={languageIntro}
          groups={languageGroups}
          primary={primary}
          topic={topic}
          onPrimary={onPrimaryChange}
          onTopic={onTopicChange}
          links={[
            { title: "总览", href: "#/overview" },
            { title: "中间件层", href: "#/mid" },
            { title: "场景层", href: "#/scene" },
          ]}
          {...layerProps}
        />
      )}
      {page === "mid" && (
        <LayerPage
          page="mid"
          title="②中间件 / 基础设施层"
          intro={middlewareIntro}
          groups={middlewareGroups}
          primary={primary}
          topic={topic}
          onPrimary={onPrimaryChange}
          onTopic={onTopicChange}
          links={[
            { title: "总览", href: "#/overview" },
            { title: "语言层", href: "#/lang" },
            { title: "场景层", href: "#/scene" },
          ]}
          {...layerProps}
        />
      )}
      {page === "scene" && (
        <LayerPage
          page="scene"
          title="③DevOps 场景层"
          intro={scenarioIntro}
          groups={scenarioGroups}
          primary={primary}
          topic={topic}
          onPrimary={onPrimaryChange}
          onTopic={onTopicChange}
          links={[
            { title: "总览", href: "#/overview" },
            { title: "中间件层", href: "#/mid" },
            { title: "语言层", href: "#/lang" },
          ]}
          {...layerProps}
        />
      )}
    </Layout>
  );
}
