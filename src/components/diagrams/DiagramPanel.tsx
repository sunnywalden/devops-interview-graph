import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Card, Tabs } from "antd";
import {
  ApartmentOutlined,
  DownOutlined,
  PartitionOutlined,
  UpOutlined,
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
  return (
    <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
      加载图示…
    </div>
  );
}

function VisualBody({ visual }: { visual: CardVisual }) {
  if (visual.kind === "mermaid") {
    return (
      <Suspense fallback={<Fallback />}>
        <MermaidBlock source={visual.source} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<Fallback />}>
      <FlowGraph nodes={visual.nodes} edges={visual.edges} height={400} />
    </Suspense>
  );
}

function initialExpanded(): boolean {
  const p = readUiPrefs();
  return p.diagramExpanded ?? true;
}

function initialTab(keys: string[]): string {
  const pref = readUiPrefs().diagramTab;
  if (pref && keys.includes(pref)) return pref;
  return keys[0];
}

export function DiagramPanel({ visuals }: { visuals?: CardVisual[] }) {
  if (!visuals?.length) return null;

  const mermaidItems = visuals.filter((v) => v.kind === "mermaid");
  const flowItems = visuals.filter((v) => v.kind === "flow");

  const tabItems = [
    mermaidItems.length
      ? {
          key: "mermaid" as const,
          label: (
            <span>
              <PartitionOutlined /> 流程
              {mermaidItems.length > 1 ? ` (${mermaidItems.length})` : ""}
            </span>
          ),
          children: (
            <div className="diagram-stack">
              {mermaidItems.map((v, i) => (
                <Card
                  key={`m-${i}`}
                  size="small"
                  title={v.title}
                  style={{ marginBottom: i < mermaidItems.length - 1 ? 12 : 0 }}
                >
                  <VisualBody visual={v} />
                </Card>
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
              <ApartmentOutlined /> 可交互
              {flowItems.length > 1 ? ` (${flowItems.length})` : ""}
            </span>
          ),
          children: (
            <div className="diagram-stack">
              {flowItems.map((v, i) => (
                <Card
                  key={`f-${i}`}
                  size="small"
                  title={v.title}
                  style={{ marginBottom: i < flowItems.length - 1 ? 12 : 0 }}
                >
                  <VisualBody visual={v} />
                </Card>
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
  const keys = useMemo(() => tabItems.map((t) => t.key), [tabItems]);
  const [expanded, setExpanded] = useState(initialExpanded);
  const [activeKey, setActiveKey] = useState(() => initialTab(keys));

  useEffect(() => {
    if (!keys.includes(activeKey as DiagramTab)) {
      setActiveKey(keys[0]);
    }
  }, [keys, activeKey]);

  const onToggle = () => {
    setExpanded((v) => {
      const next = !v;
      writeUiPrefs({ diagramExpanded: next });
      return next;
    });
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
    <Card
      className="diagram-panel"
      title="知识图示"
      extra={
        <div className="diagram-panel__extra">
          <a className="diagram-skip" href="#card-followups">
            跳到追问
          </a>
          <Button
            type="text"
            size="small"
            className="diagram-panel__toggle"
            icon={expanded ? <UpOutlined /> : <DownOutlined />}
            onClick={onToggle}
            aria-expanded={expanded}
          >
            {expanded ? "收起" : "展开"}
          </Button>
        </div>
      }
      styles={{
        body: {
          paddingTop: expanded ? 8 : 0,
          paddingBottom: expanded ? 16 : 0,
        },
      }}
    >
      {expanded && (
        <Tabs
          activeKey={safeKey}
          onChange={onTab}
          items={tabItems}
          destroyInactiveTabPane
        />
      )}
    </Card>
  );
}
