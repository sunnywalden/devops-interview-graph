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

const ACCENT = "#E6A23C";
const EDGE = "#8B9BB0";
const NODE_BG = "#161E29";
const NODE_FG = "#E8EEF4";

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
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
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
          boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
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
        animated: true,
        style: { stroke: EDGE },
        labelStyle: { fill: "#8B9BB0", fontSize: 11 },
        labelBgStyle: { fill: "#121821", fillOpacity: 0.9 },
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
        panOnScroll
        zoomOnScroll
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background gap={18} size={1} color="#243041" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(11,15,20,0.75)"
          nodeColor={ACCENT}
        />
      </ReactFlow>
    </div>
  );
}
