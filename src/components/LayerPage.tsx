import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Segmented, Select, Typography } from "antd";
import { ExpandOutlined, CompressOutlined } from "@ant-design/icons";
import type { PageId, SegmentGroup } from "../types";
import { CardView } from "./CardView";
import {
  isLayerPageId,
  markCardVisited,
  readVisitedForPage,
  writeUiPrefs,
  type LayerPageId,
} from "../uiPrefs";

const { Title, Text } = Typography;

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

  const [visitedCount, setVisitedCount] = useState(0);

  const stageRef = useRef<HTMLElement>(null);
  const scrollBehavior = useRef<ScrollBehavior>("smooth");

  useEffect(() => {
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
      if (!forward && !back) return;

      const target = e.target instanceof Element ? e.target : null;
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
        if (
          target.closest(
            ".ant-select, .ant-segmented, .ant-select-dropdown, [role='listbox'], [role='combobox']",
          )
        ) {
          return;
        }
      }
      if (
        document.querySelector(".ant-select-open") ||
        document.querySelector(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      ) {
        return;
      }

      const cards = group.cards;
      const idx = cards.findIndex((c) => c.id === card.id);
      if (idx < 0) return;
      const next = forward ? idx + 1 : idx - 1;
      if (next < 0 || next >= cards.length) return;
      e.preventDefault();
      scrollBehavior.current = "auto";
      onTopic(cards[next].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [group, card.id, onTopic]);

  useEffect(() => {
    if (!isLayerPageId(page)) return;
    const ids = markCardVisited(page as LayerPageId, card.id);
    setVisitedCount(ids.length);
  }, [page, card.id]);

  useEffect(() => {
    if (!isLayerPageId(page)) return;
    setVisitedCount(readVisitedForPage(page as LayerPageId).length);
  }, [page]);

  const pageLabel =
    page === "lang" ? "语言层" : page === "mid" ? "中间件层" : "场景层";

  const progressPct =
    totalCards > 0 ? Math.min(100, Math.round((visitedCount / totalCards) * 100)) : 0;

  const toggleFocus = () => {
    const next = !focusMode;
    writeUiPrefs({ focusMode: next });
    onFocusMode(next);
  };

  return (
    <div className="layer-page">
      {!focusMode && (
        <div className="layer-page__intro">
          <Title level={2} style={{ marginBottom: 6, fontSize: 22 }}>
            {title}
          </Title>
          <p className="page-subtitle">{intro}</p>
        </div>
      )}

      <div className="layer-toolbar">
        <div className="train-bar" role="group" aria-label={`${pageLabel}导航`}>
          <div className="layer-toolbar__row">
            <div className="segmented-wrap layer-toolbar__seg">
              <Segmented
                block
                shape="round"
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
              icon={focusMode ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleFocus}
              aria-pressed={focusMode}
              aria-label={focusMode ? "退出今日口播焦点" : "今日口播焦点模式"}
            >
              {focusMode ? "退出焦点" : "今日口播"}
            </Button>
          </div>
          <Select
            className="train-select"
            style={{ width: "100%" }}
            value={card.id}
            options={group.cards.map((c) => ({
              value: c.id,
              label: `${group.label} · ${c.label}`,
            }))}
            onChange={onTopic}
            showSearch
            optionFilterProp="label"
            placeholder="选择知识点"
            aria-label="知识点"
            classNames={{ popup: { root: "train-select-dropdown" } }}
          />
          <div className="train-bar__meta">
            <div
              className="layer-visit-progress"
              role="status"
              aria-label={`本层已浏览 ${visitedCount} / ${totalCards}`}
              title="本层已打开过的知识点（本机）"
            >
              <div className="layer-visit-progress__track">
                <div
                  className="layer-visit-progress__fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span key={visitedCount} className="layer-visit-progress__label is-tick">
                本层 {visitedCount}/{totalCards}
              </span>
            </div>
            <p className="train-hint" id="card-kbd-hint">
              本组相邻
              <kbd>←</kbd>
              <kbd>→</kbd>
              <span className="train-hint__or">或</span>
              <kbd>j</kbd>
              <kbd>k</kbd>
            </p>
          </div>
        </div>
      </div>

      <section
        ref={stageRef}
        className="card-stage"
        aria-label={`${pageLabel}知识点`}
        aria-keyshortcuts="ArrowLeft ArrowRight j k"
        aria-describedby="card-kbd-hint"
      >
        <div key={card.id} className="card-transition">
          <CardView card={card} />
        </div>
      </section>

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
