import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Segmented, Select, Space, Typography } from "antd";
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

  useEffect(() => {
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [primary, topic, page]);

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
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {!focusMode && (
        <div>
          <Title level={2} style={{ marginBottom: 6, fontSize: 22 }}>
            {title}
          </Title>
          <p className="page-subtitle">{intro}</p>
        </div>
      )}

      <div className="layer-toolbar">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div className="layer-toolbar__row">
            <div className="segmented-wrap layer-toolbar__seg">
              <Segmented
                block
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
          />
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
            <span className="layer-visit-progress__label">
              本层 {visitedCount}/{totalCards}
            </span>
          </div>
        </Space>
      </div>

      <section
        ref={stageRef}
        className="card-stage"
        aria-label={`${pageLabel}知识点`}
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
    </Space>
  );
}
