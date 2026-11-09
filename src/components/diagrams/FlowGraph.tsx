import { useLocale } from "../../i18n/useLocale";
import { useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowEdge, FlowNode } from "../../types";

const ACCENT = "#78956b";
const EDGE = "#8b9c7e";
const NODE_BG = "#f8faf2";
const NODE_FG = "#395438";

type Props = {
  nodes: FlowNode[];
  edges: FlowEdge[];
  height?: number;
};

function autoPosition(nodes: FlowNode[]): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  const withPos = nodes.filter((n) => n.x != null && n.y != null);
  if (withPos.length === nodes.length) {
    for (const n of nodes) map.set(n.id, { x: n.x!, y: n.y! });
    return map;
  }
  const cols = Math.min(3, Math.max(1, Math.ceil(Math.sqrt(nodes.length))));
  nodes.forEach((n, i) => {
    if (n.x != null && n.y != null) {
      map.set(n.id, { x: n.x, y: n.y });
    } else {
      const col = i % cols;
      const row = Math.floor(i / cols);
      map.set(n.id, { x: col * 220, y: row * 110 });
    }
  });
  return map;
}

export function FlowGraph({ nodes, edges, height = 400 }: Props) {
  const { t } = useLocale();
  const pos = useMemo(() => autoPosition(nodes), [nodes]);

  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        position: pos.get(n.id) ?? { x: 0, y: 0 },
        data: {
          label: (
            <div style={{ textAlign: "center", lineHeight: 1.35 }}>
              <div style={{ fontWeight: 600 }}>{n.label}</div>
              {n.detail ? (
                <div style={{ fontSize: 11, opacity: 1, marginTop: 2 }}>
                  {n.detail}
                </div>
              ) : null}
            </div>
          ),
        },
        style: {
          background: NODE_BG,
          color: NODE_FG,
          border: `1px solid ${ACCENT}`,
          borderRadius: 10,
          padding: 8,
          fontSize: 13,
          minWidth: 120,
          boxShadow: "none",
        },
      })),
    [nodes, pos],
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      edges.map((e, i) => ({
        id: `e-${e.from}-${e.to}-${i}`,
        source: e.from,
        target: e.to,
        label: e.label,
        animated: false,
        style: { stroke: EDGE },
        labelStyle: { fill: "#59694f", fontSize: 11 },
        labelBgStyle: { fill: "#f8faf2", fillOpacity: 0.9 },
        markerEnd: { type: MarkerType.ArrowClosed, color: EDGE },
      })),
    [edges],
  );

  return (
    <div className="flow-graph-host" style={{ height, width: "100%" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        minZoom={0.15}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        colorMode="light"
        ariaLabelConfig={{ "controls.zoomIn.ariaLabel": t("放大图谱"), "controls.zoomOut.ariaLabel": t("缩小图谱"), "controls.fitView.ariaLabel": t("适应画布") }}
      >
        <Background gap={18} size={1} color="#dce5d1" />
        <Controls showInteractive={false} aria-label={t("图谱控件")} />
        <MiniMap
          ariaLabel={t("图谱缩略图")}
          pannable
          zoomable
          maskColor="rgba(247,249,241,0.8)"
          nodeColor={ACCENT}
        />
      </ReactFlow>
    </div>
  );
}
