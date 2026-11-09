import { useEffect, useId, useMemo, useState } from "react";
import {
  CaretRightOutlined,
  LeftOutlined,
  PauseOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useLocale } from "../../i18n/useLocale";
import type { FlowEdge, FlowNode } from "../../types";
import { graphAccessibility } from "./graphAccessibility";

const STEP_MS = 2400;
const FIT = { padding: 0.22 };
const SIDES = [Position.Top, Position.Right, Position.Bottom, Position.Left];
const OPPOSITE = {
  [Position.Top]: Position.Bottom,
  [Position.Right]: Position.Left,
  [Position.Bottom]: Position.Top,
  [Position.Left]: Position.Right,
};
type Point = { x: number; y: number };
type LessonNode = Node<{
  label: string;
  detail?: string;
  state: "idle" | "source" | "target" | "inspected";
  inspect: (id: string) => void;
}, "lesson">;

function LessonGraphNode({ id, data }: NodeProps<LessonNode>) {
  return (
    <>
      {SIDES.map((side) => (
        <Handle key={side} id={side} position={side} type="target" isConnectable={false} />
      ))}
      <button
        className={`lesson-node nopan lesson-node--${data.state}`}
        type="button"
        aria-pressed={data.state === "inspected"}
        onClick={() => data.inspect(id)}
      >
        <strong>{data.label}</strong>
        {data.detail && <span>{data.detail}</span>}
      </button>
      {SIDES.map((side) => (
        <Handle key={side} id={side} position={side} type="source" isConnectable={false} />
      ))}
    </>
  );
}

const NODE_TYPES = { lesson: LessonGraphNode };

function autoPosition(nodes: FlowNode[]): Map<string, Point> {
  const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(nodes.length))));
  return new Map(nodes.map(({ id, x, y }, i) => [
    id,
    x != null && y != null ? { x, y } : { x: (i % cols) * 220, y: Math.floor(i / cols) * 110 },
  ]));
}

function edgeSide(from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) >= 155 && Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? Position.Right : Position.Left;
  }
  return dy < 0 ? Position.Top : Position.Bottom;
}

export function FlowGraph({ nodes, edges, title }: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  title: string;
}) {
  const { t, locale } = useLocale();
  const id = useId();
  const positions = useMemo(() => autoPosition(nodes), [nodes]);
  const byId = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const current = edges[step];
  const inspected = inspectedId ? byId.get(inspectedId) : undefined;
  const atEnd = step === edges.length - 1 && !!current;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (atEnd) setPlaying(false);
      else setStep((index) => index + 1);
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [atEnd, playing, step]);

  function inspect(nodeId: string) {
    setPlaying(false);
    setInspectedId((previous) => previous === nodeId ? null : nodeId);
  }

  function move(index: number) {
    setPlaying(false);
    setInspectedId(null);
    setStep(index);
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      return;
    }
    setInspectedId(null);
    if (step < 0 || atEnd) setStep(0);
    setPlaying(true);
  }

  const rfNodes: LessonNode[] = nodes.map((node) => ({
    id: node.id,
    type: "lesson",
    position: positions.get(node.id)!,
    data: {
      label: node.label,
      detail: node.detail,
      state: inspected
        ? (inspected.id === node.id ? "inspected" : "idle")
        : current?.to === node.id ? "target" : current?.from === node.id ? "source" : "idle",
      inspect,
    },
  }));

  const rfEdges: Edge[] = edges.map((edge, index) => {
    const side = edgeSide(positions.get(edge.from)!, positions.get(edge.to)!);
    const active = !inspected && step === index;
    const related = inspected && (edge.from === inspected.id || edge.to === inspected.id);
    const color = active || related ? "var(--green)" : "#899a80";
    return {
      id: `e-${index}`,
      source: edge.from,
      target: edge.to,
      sourceHandle: side,
      targetHandle: OPPOSITE[side],
      label: edge.label,
      ariaLabel: t("{from} 指向 {to}", { from: byId.get(edge.from)!.label, to: byId.get(edge.to)!.label }),
      animated: active && playing,
      zIndex: active ? 1 : 0,
      style: { stroke: color, strokeWidth: active ? 3 : related ? 2.25 : 1.25 },
      labelStyle: { fill: "var(--ink)", fontSize: 11, fontWeight: active ? 700 : 400 },
      labelBgStyle: { fill: active ? "var(--sage)" : "var(--paper)", fillOpacity: 1 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
    };
  });

  function connection(edge: FlowEdge) {
    return (
      <>
        {byId.get(edge.from)?.label}
        {" → "}
        {byId.get(edge.to)?.label}
        {edge.label && <span className="lesson-flow__relation"> · {edge.label}</span>}
      </>
    );
  }

  return (
    <section className="lesson-flow" aria-label={title}>
      <div className="lesson-flow__toolbar" role="group" aria-label={t("演示控件")}>
        {edges.length > 0 && (
          <>
            <button className="lesson-flow__play" type="button" onClick={togglePlayback}>
              {playing ? <PauseOutlined aria-hidden="true" /> : atEnd ? <ReloadOutlined aria-hidden="true" /> : <CaretRightOutlined aria-hidden="true" />}
              {t(playing ? "暂停演示" : atEnd ? "重播演示" : step >= 0 ? "继续播放" : "播放演示")}
            </button>
            <button type="button" disabled={step <= 0} onClick={() => move(step - 1)}>
              <LeftOutlined aria-hidden="true" />{t("上一步")}
            </button>
            <button type="button" disabled={atEnd} onClick={() => move(step + 1)}>
              {t("下一步")}<RightOutlined aria-hidden="true" />
            </button>
          </>
        )}
        <span className="lesson-flow__count">
          {t("演示进度 {current} / {total}", { current: step + 1, total: edges.length })}
        </span>
      </div>
      <p className="lesson-flow__hint" id={id}>{t("逐条查看图中关系，也可以点选节点查看说明和相连的节点。")}</p>
      <div className="lesson-flow__details">
        <div aria-live="polite" aria-atomic="true">
          {inspected ? (
            <>
              <p className="lesson-flow__detail-label">{t("节点说明")}</p>
              <p className="lesson-flow__detail-title">{inspected.label}</p>
              {inspected.detail && <p>{inspected.detail}</p>}
              {edges.some((edge) => edge.from === inspected.id || edge.to === inspected.id) && (
                <ul>
                  {edges.map((edge, i) => edge.from === inspected.id || edge.to === inspected.id
                    ? <li key={i}>{connection(edge)}</li>
                    : null)}
                </ul>
              )}
            </>
          ) : current ? (
            <>
              <p className="lesson-flow__detail-label">{t("当前连线")}</p>
              <p className="lesson-flow__detail-title">{connection(current)}</p>
              {byId.get(current.to)?.detail && <p>{byId.get(current.to)?.detail}</p>}
            </>
          ) : (
            <p>{t("播放演示，或点选节点开始探索。")}</p>
          )}
        </div>
      </div>
      <div className="flow-graph-host lesson-flow__canvas">
        <ReactFlow
          aria-label={t("可交互知识图")}
          aria-describedby={id}
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={FIT}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          disableKeyboardA11y
          deleteKeyCode={null}
          zoomOnScroll={false}
          minZoom={0.15}
          maxZoom={1.6}
          proOptions={{ hideAttribution: true }}
          ariaLabelConfig={graphAccessibility(locale)}
        >
          <Background gap={18} size={1} color="#c4cfbc" />
          <Controls orientation="horizontal" showInteractive={false} fitViewOptions={FIT} />
        </ReactFlow>
      </div>
    </section>
  );
}
