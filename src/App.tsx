import { useLocale } from "./i18n/useLocale";
import { localizedGroups, localizedIntro } from "./i18n/content";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Layout } from "./components/Layout";
import { LayerPage } from "./components/LayerPage";
import { OverviewPage } from "./pages/OverviewPage";
import type { Bookmark, PageId } from "./types";
import { toHash, writeBookmark, nowStamp } from "./bookmark";
import { writeUiPrefs } from "./uiPrefs";
import { useBookmarkStore, useUiPrefs } from "./useSavedState";
import { groupsForPage, overviewSelection, resolveRoute, routeLabel } from "./routing";

export default function App() {
  const { t, locale } = useLocale();
  const initial = useMemo(() => resolveRoute(window.location.hash), []);
  const [page, setPage] = useState<PageId>(initial.page);
  const [primary, setPrimary] = useState(initial.primary);
  const [topic, setTopic] = useState(initial.topic);
  const bookmark = useBookmarkStore()?.current ?? null;
  const prefs = useUiPrefs();
  const focusMode = prefs.focusMode === true;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const setFocusModePersist = useCallback((on: boolean) => {
    writeUiPrefs({ focusMode: on });
  }, []);

  const persist = useCallback((p: PageId, prim: string, top: string) => {
    const label = routeLabel({ page: p, primary: prim, topic: top });
    const b: Bookmark = {
      page: p,
      primary: prim,
      topic: top,
      label,
      updatedAt: nowStamp(),
    };
    if (p === "overview" && prim === "star") writeUiPrefs({ overviewStar: top });
    if (p === "overview" && prim === "plan" && (top === "3d" || top === "5d")) writeUiPrefs({ overviewPlan: top });
    writeBookmark(b);
    const hash = toHash(p, prim, top);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, []);

  // initial sync hash + bookmark (write full deep hash)
  useEffect(() => {
    persist(initial.page, initial.primary, initial.topic);
  }, [initial, persist]);

  useEffect(() => {
    const onHash = () => {
      const r = resolveRoute(window.location.hash);
      setPage(r.page);
      setPrimary(r.primary);
      setTopic(r.topic);
      persist(r.page, r.primary, r.topic);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [persist]);

  // Esc exits focus mode
  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || e.isComposing) return;
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

  const onOverviewSection = (section: string) => {
    setPrimary(section);
    setTopic("start");
    persist("overview", section, "start");
  };

  const remembered = overviewSelection(prefs);
  const overviewStar =
    page === "overview" && primary === "star" ? topic : remembered.star;
  const overviewPlan =
    page === "overview" &&
    primary === "plan" &&
    (topic === "3d" || topic === "5d")
      ? topic
      : remembered.plan;

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
      focusMode={chromeFocus}
      onExitFocus={() => setFocusModePersist(false)}
    >
      {page === "overview" && (
        <OverviewPage
          section={primary}
          onSection={onOverviewSection}
          star={overviewStar}
          plan={overviewPlan}
          onStar={onStar}
          onPlan={onPlan}
        />
      )}
      {page === "lang" && (
        <LayerPage
          page="lang"
          title={t("语言基础")}
          intro={localizedIntro("lang", locale)}
          groups={localizedGroups("lang", locale)}
          primary={primary}
          topic={topic}
          onPrimary={onPrimaryChange}
          onTopic={onTopicChange}
          links={[
            { title: t("总览"), href: "#/overview" },
            { title: t("中间件层"), href: "#/mid" },
            { title: t("场景层"), href: "#/scene" },
          ]}
          {...layerProps}
        />
      )}
      {page === "mid" && (
        <LayerPage
          page="mid"
          title={t("中间件与容器")}
          intro={localizedIntro("mid", locale)}
          groups={localizedGroups("mid", locale)}
          primary={primary}
          topic={topic}
          onPrimary={onPrimaryChange}
          onTopic={onTopicChange}
          links={[
            { title: t("总览"), href: "#/overview" },
            { title: t("语言层"), href: "#/lang" },
            { title: t("场景层"), href: "#/scene" },
          ]}
          {...layerProps}
        />
      )}
      {page === "scene" && (
        <LayerPage
          page="scene"
          title={t("场景实战")}
          intro={localizedIntro("scene", locale)}
          groups={localizedGroups("scene", locale)}
          primary={primary}
          topic={topic}
          onPrimary={onPrimaryChange}
          onTopic={onTopicChange}
          links={[
            { title: t("总览"), href: "#/overview" },
            { title: t("中间件层"), href: "#/mid" },
            { title: t("语言层"), href: "#/lang" },
          ]}
          {...layerProps}
        />
      )}
    </Layout>
  );
}
