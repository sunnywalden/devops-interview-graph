import { useLocale } from "../../i18n/useLocale";
import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { Tabs } from "antd";
import {
  ApartmentOutlined,
  PartitionOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { CardVisual } from "../../types";
import {
  readUiPrefs,
  writeUiPrefs,
  type DiagramTab,
} from "../../uiPrefs";

const MermaidBlock = lazy(() =>
  import("./MermaidBlock").then((m) => ({ default: m.MermaidBlock })),
);
const FlowGraph = lazy(() =>
  import("./FlowGraph").then((m) => ({ default: m.FlowGraph })),
);

function Fallback() {
  const { t } = useLocale();
  return (
    <div style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>{t("加载图示…")}</div>
  );
}

function VisualBody({ visual }: { visual: CardVisual }) {
  if (visual.kind === "mermaid") {
    return (
      <Suspense fallback={<Fallback />}>
        <MermaidBlock key={visual.source} source={visual.source} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<Fallback />}>
      <FlowGraph nodes={visual.nodes} edges={visual.edges} title={visual.title} />
    </Suspense>
  );
}

function initialExpanded(): boolean {
  const p = readUiPrefs();
  return p.diagramExpanded ?? false;
}

function initialTab(keys: string[]): string {
  const pref = readUiPrefs().diagramTab;
  if (pref && keys.includes(pref)) return pref;
  return keys[0];
}

export function DiagramPanel({ visuals }: { visuals?: CardVisual[] }) {
  const { t } = useLocale();
  if (!visuals?.length) return null;

  const mermaidItems = visuals.filter((v) => v.kind === "mermaid");
  const flowItems = visuals.filter((v) => v.kind === "flow");

  const tabItems = [
    mermaidItems.length
      ? {
          key: "mermaid" as const,
          label: (
            <span>
              <PartitionOutlined aria-hidden="true" />{t("流程")}{mermaidItems.length > 1 ? ` (${mermaidItems.length})` : ""}
            </span>
          ),
          children: (
            <div className="diagram-stack">
              {mermaidItems.map((v, i) => (
                <div key={`m-${i}`} className="diagram-sheet diagram-sheet--mermaid">
                  {v.title ? <div className="diagram-sheet__title">{v.title}</div> : null}
                  <VisualBody visual={v} />
                </div>
              ))}
            </div>
          ),
        }
      : null,
    flowItems.length
      ? {
          key: "flow" as const,
          label: (
            <span>
              <ApartmentOutlined aria-hidden="true" />{t("交互演示")}{flowItems.length > 1 ? ` (${flowItems.length})` : ""}
            </span>
          ),
          children: (
            <div className="diagram-stack">
              {flowItems.map((v, i) => (
                <div key={`f-${i}`} className="diagram-sheet diagram-sheet--flow">
                  {v.title ? <div className="diagram-sheet__title">{v.title}</div> : null}
                  <VisualBody visual={v} />
                </div>
              ))}
            </div>
          ),
        }
      : null,
  ].filter(Boolean) as {
    key: DiagramTab;
    label: ReactNode;
    children: ReactNode;
  }[];

  if (!tabItems.length) return null;

  return <DiagramPanelInner tabItems={tabItems} />;
}

function DiagramPanelInner({
  tabItems,
}: {
  tabItems: { key: DiagramTab; label: ReactNode; children: ReactNode }[];
}) {
  const { t } = useLocale();
  const keys = useMemo(() => tabItems.map((t) => t.key), [tabItems]);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [activeKey, setActiveKey] = useState(() => initialTab(keys));

  const onToggle = () => {
    const next = !expanded;
    setExpanded(next);
    writeUiPrefs({ diagramExpanded: next });
  };

  const onTab = (key: string) => {
    const k = key as DiagramTab;
    setActiveKey(k);
    writeUiPrefs({ diagramTab: k });
  };

  const safeKey = keys.includes(activeKey as DiagramTab)
    ? activeKey
    : keys[0];

  return (
    <section
      className={`stage-card diagram-panel${expanded ? " is-open" : ""}`}
      aria-label={t("知识图示")}
    >
      <header className="diagram-panel__bar">
        <h3 className="diagram-panel__title">{t("知识图示")}</h3>
        <div className="diagram-panel__extra">
          <a className="diagram-skip" href="#card-followups" onClick={(event) => { event.preventDefault(); document.getElementById("card-followups")?.focus(); }}>{t("跳到追问")}</a>
          <button
            type="button"
            className="diagram-panel__toggle"
            onClick={onToggle}
            aria-expanded={expanded}
          >
            <RightOutlined aria-hidden="true" className="diagram-panel__chevron" />
            {expanded ? t("收起") : t("展开")}
          </button>
        </div>
      </header>
      {expanded && (
        <div className="diagram-panel__body">
          <Tabs
            className="diagram-tabs"
            type="line"
            activeKey={safeKey}
            onChange={onTab}
            items={tabItems}
            destroyOnHidden
          />
        </div>
      )}
    </section>
  );
}
