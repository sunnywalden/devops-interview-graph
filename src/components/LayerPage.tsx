import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Button, Segmented, Typography } from "antd";
import { ExpandOutlined, CompressOutlined } from "@ant-design/icons";
import type { PageId, SegmentGroup } from "../types";
import { CardView } from "./CardView";
import { TopicPager } from "./TopicPager";
import {
  isLayerPageId,
  markCardVisited,
} from "../uiPrefs";
import { useUiPrefs } from "../useSavedState";

const { Text } = Typography;

export function LayerPage({
  page,
  title,
  intro,
  groups,
  primary,
  topic,
  onPrimary,
  onTopic,
  links,
  focusMode,
  onFocusMode,
}: {
  page: PageId;
  title: string;
  intro: string;
  groups: SegmentGroup[];
  primary: string;
  topic: string;
  onPrimary: (id: string) => void;
  onTopic: (id: string) => void;
  links: { title: string; href: string }[];
  focusMode: boolean;
  onFocusMode: (on: boolean) => void;
}) {
  const group = useMemo(
    () => groups.find((g) => g.id === primary) ?? groups[0],
    [groups, primary],
  );
  const card = useMemo(
    () => group.cards.find((c) => c.id === topic) ?? group.cards[0],
    [group, topic],
  );

  const totalCards = useMemo(
    () => groups.reduce((n, g) => n + g.cards.length, 0),
    [groups],
  );

  const prefs = useUiPrefs();
  const visitedIds = new Set(isLayerPageId(page) ? prefs.visitedByPage?.[page] : []);
  const visitedCount = groups.flatMap((item) => item.cards).filter((item) => visitedIds.has(item.id)).length;

  const toolbarRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const previousLocation = useRef({ page, primary, topic });
  const scrollBehavior = useRef<ScrollBehavior>("smooth");
  const swipeRef = useRef({
    tracking: false,
    startX: 0,
    startY: 0,
    startAt: 0,
  });

  // Keep anchor/focus targets below the actual sticky toolbar, including wrapped labels.
  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const measure = () => {
      const height = getComputedStyle(toolbar).position === "sticky" ? toolbar.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty("--layer-toolbar-height", `${height}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(toolbar);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--layer-toolbar-height");
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const previous = previousLocation.current;
    previousLocation.current = { page, primary, topic };
    if (previous.page !== page) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    if (previous.primary === primary && previous.topic === topic) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = reduce ? "auto" : scrollBehavior.current;
    scrollBehavior.current = "smooth";
    stageRef.current?.scrollIntoView({ behavior, block: "start" });
  }, [primary, topic, page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.defaultPrevented ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey ||
        e.isComposing
      ) {
        return;
      }
      const forward = e.key === "ArrowRight" || e.key === "j";
      const back = e.key === "ArrowLeft" || e.key === "k";
      const home = e.key === "Home";
      const end = e.key === "End";
      if (!forward && !back && !home && !end) return;

      const target = e.target instanceof Element ? e.target : null;
      // Letter shortcuts and Home/End belong to this focused control, not the whole page.
      if (target !== stageRef.current && !target?.closest(".topic-pager")) return;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          (target instanceof HTMLElement && target.isContentEditable)
        ) {
          return;
        }
        // Segmented and the open directory own their keys.
        if (target.closest(".ant-segmented, [data-topic-directory], .flow-graph-host, summary")) return;
      }
      if (document.querySelector("[data-topic-directory]")) return;

      const cards = group.cards;
      const idx = cards.findIndex((c) => c.id === card.id);
      if (idx < 0) return;
      let next = idx;
      if (home) next = 0;
      else if (end) next = cards.length - 1;
      else if (forward) next = idx + 1;
      else next = idx - 1;
      if (next < 0 || next >= cards.length || next === idx) return;
      e.preventDefault();
      scrollBehavior.current = "auto";
      onTopic(cards[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [group, card.id, onTopic]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const swipe = swipeRef.current;

    const onStart = (e: TouchEvent) => {
      swipe.tracking = false;
      if (e.touches.length !== 1) return;
      if (document.querySelector("[data-topic-directory]")) return;
      const target = e.target instanceof Element ? e.target : null;
      const oral = target?.closest(".oral-hero");
      if (!oral || !stage.contains(oral)) return;
      swipe.tracking = true;
      swipe.startX = e.touches[0].clientX;
      swipe.startY = e.touches[0].clientY;
      swipe.startAt = Date.now();
    };

    const onEnd = (e: TouchEvent) => {
      if (!swipe.tracking) return;
      swipe.tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - swipe.startX;
      const dy = touch.clientY - swipe.startY;
      // Functional swipe only. Card motion stays in CSS and already
      // drops out under prefers-reduced-motion.
      if (Date.now() - swipe.startAt > 700) return;
      if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim()) return;
      const cards = group.cards;
      const idx = cards.findIndex((c) => c.id === card.id);
      if (idx < 0) return;
      const next = dx < 0 ? idx + 1 : idx - 1;
      if (next < 0 || next >= cards.length) return;
      scrollBehavior.current = "auto";
      onTopic(cards[next].id);
    };

    const onCancel = () => {
      swipe.tracking = false;
    };

    stage.addEventListener("touchstart", onStart, { passive: true });
    stage.addEventListener("touchend", onEnd);
    stage.addEventListener("touchcancel", onCancel);
    return () => {
      stage.removeEventListener("touchstart", onStart);
      stage.removeEventListener("touchend", onEnd);
      stage.removeEventListener("touchcancel", onCancel);
    };
  }, [group, card.id, onTopic]);

  useEffect(() => {
    if (!isLayerPageId(page)) return;
    markCardVisited(page, card.id);
  }, [page, card.id]);

  const pageLabel =
    page === "lang" ? "语言层" : page === "mid" ? "中间件层" : "场景层";

  const cardIndex = group.cards.findIndex((item) => item.id === card.id);
  const nextCard = group.cards[cardIndex + 1];
  const nextGroup = groups[groups.findIndex((item) => item.id === group.id) + 1];
  const remaining = group.cards.length - cardIndex - 1;
  const continueLearning = () => {
    // Move focus out of the footer before the newly selected content scrolls into view.
    stageRef.current?.focus({ preventScroll: true });
    if (nextCard) onTopic(nextCard.id);
    else if (nextGroup) onPrimary(nextGroup.id);
  };

  const toggleFocus = () => {
    const next = !focusMode;
    onFocusMode(next);
  };

  return (
    <div className="layer-page">
      {focusMode && <h1 className="sr-only">{title} · 专注口述</h1>}
      {!focusMode && (
        <div className="layer-page__intro">
          <p className="eyebrow">THE LEARNING ROOM / {page === "lang" ? "01" : page === "mid" ? "02" : "03"}</p>
          <h1>{title}</h1>
          <p className="page-subtitle">把原理、取舍与项目经验，连成一段清楚的表达。</p>
          <details className="layer-intro-note"><summary>本层学习提示</summary><p>{intro}</p></details>
        </div>
      )}

      <div className="layer-toolbar" ref={toolbarRef}>
        <div className="train-bar" role="group" aria-label={`${pageLabel}导航`}>
          <div className="layer-toolbar__row">
            <div className="segmented-wrap layer-toolbar__seg">
              <Segmented
                block
                className="train-segmented"
                value={group.id}
                options={groups.map((g) => ({ value: g.id, label: g.label }))}
                onChange={(v) => onPrimary(String(v))}
                aria-label={`${pageLabel}分段`}
              />
            </div>
            <Button
              type={focusMode ? "primary" : "default"}
              size="middle"
              className="focus-toggle-btn"
              icon={focusMode ? <CompressOutlined aria-hidden="true" /> : <ExpandOutlined aria-hidden="true" />}
              onClick={toggleFocus}
              aria-pressed={focusMode}
              aria-label={focusMode ? "退出专注练习" : "进入专注练习"}
            >
              {focusMode ? "退出专注" : "专注练习"}
            </Button>
          </div>
          <TopicPager
            key={`${page}:${group.id}`}
            items={group.cards}
            value={card.id}
            onChange={onTopic}
            ariaLabel="知识点"
            scopeLabel={group.label}
          />
          <div className="train-bar__meta">
            <div
              className="layer-visit-progress"
              role="status"
              aria-label={`本层浏览记录 ${visitedCount} / ${totalCards}，仅记录打开，不代表掌握`}
            >
              <span className="layer-visit-progress__label">
                本层浏览记录 {visitedCount}/{totalCards} · 仅记录打开
              </span>
            </div>
            <p className="train-hint" id="card-kbd-hint">
              聚焦卡片或导航后
              <kbd>←</kbd>
              <kbd>→</kbd>
              <span className="train-hint__or">或</span>
              <kbd>j</kbd>
              <kbd>k</kbd>
              <span className="train-hint__or">·</span>
              <kbd>Home</kbd>
              <kbd>End</kbd>
              <span className="train-hint__swipe">口播区可左右滑</span>
            </p>
          </div>
        </div>
      </div>

      <section
        ref={stageRef}
        className="card-stage"
        tabIndex={0}
        aria-label={`${pageLabel}知识点`}
        aria-keyshortcuts="ArrowLeft ArrowRight j k Home End"
        aria-describedby="card-kbd-hint"
      >
        <div key={card.id} className="card-transition">
          <CardView card={card} />
        </div>
      </section>

      <nav className="study-continuation print-hide" aria-label="继续学习">
        <div className="study-continuation__copy">
          <p className="eyebrow">{group.label} · 第 {cardIndex + 1} / {group.cards.length} 个知识点</p>
          <h2>{nextCard ? `本组后面还有 ${remaining} 个知识点` : "已到本组最后一个知识点"}</h2>
          <p>{nextCard ? "先尝试脱稿口述，再继续下一个知识点。" : nextGroup ? `后面还有「${nextGroup.label}」一组，可以继续学习。` : "已到本层目录末尾。浏览不等于掌握，可通过全部目录回顾遗漏与薄弱知识点。"}</p>
        </div>
        {nextCard || nextGroup ? (
          <button type="button" className="study-continuation__next" onClick={continueLearning}>
            <span>{nextCard ? "继续下一个知识点" : "继续下一组"}<strong>{nextCard?.label ?? nextGroup?.label}</strong></span>
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" className="study-continuation__review" onClick={() => {
            toolbarRef.current?.querySelector<HTMLButtonElement>(".topic-pager__dir")?.click();
          }}>打开全部目录，回顾本组</button>
        )}
      </nav>

      {!focusMode && (
        <nav className="related-links" aria-label="相关层">
          <Text type="secondary">相关：</Text>
          {links.map((l) => (
            <a key={l.href + l.title} href={l.href}>
              {l.title}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
