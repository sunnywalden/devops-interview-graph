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
import { diagramNodes } from "../../data/overview";

const LAYER_Y: Record<number, number> = { 1: 40, 2: 200, 3: 380 };

/** Muted botanical tones distinguish the three knowledge layers. */
const LAYER_COLOR: Record<number, string> = {
  1: "#77966a",
  2: "#a3a276",
  3: "#648976",
};

const SUPPORT_EDGES: { from: string; to: string; label?: string }[] = [
  { from: "go", to: "mysql", label: "读写" },
  { from: "go", to: "mongo", label: "文档" },
  { from: "go", to: "mq", label: "消息" },
  { from: "go", to: "k8s", label: "部署" },
  { from: "py", to: "mysql", label: "平台数据" },
  { from: "py", to: "k8s", label: "运维" },
  { from: "py", to: "redis", label: "缓存" },
  { from: "mysql", to: "cicd", label: "迁移门禁" },
  { from: "redis", to: "monitor", label: "指标" },
  { from: "mq", to: "cmdb", label: "最终一致" },
  { from: "docker", to: "cicd", label: "镜像" },
  { from: "k8s", to: "cicd", label: "发布" },
  { from: "k8s", to: "ops", label: "平台" },
  { from: "k8s", to: "monitor", label: "可观测" },
  { from: "mongo", to: "cmdb", label: "资产" },
  { from: "mongo", to: "report", label: "预计算" },
  { from: "net", to: "ops", label: "证书/解析" },
];

export function OverviewFlow({ height }: { height?: number } = {}) {
  const nodes: Node[] = useMemo(() => {
    const byLayer: Record<number, typeof diagramNodes> = { 1: [], 2: [], 3: [] };
    for (const n of diagramNodes) byLayer[n.layer].push(n);

    const out: Node[] = [];
    for (const layer of [1, 2, 3] as const) {
      const list = byLayer[layer];
      const gap = 140;
      const totalW = (list.length - 1) * gap;
      const startX = Math.max(20, 520 - totalW / 2);
      list.forEach((n, i) => {
        out.push({
          id: n.id,
          position: { x: startX + i * gap, y: LAYER_Y[layer] },
          data: {
            label: (
              <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                <div style={{ fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 11, opacity: 1 }}>{n.detail}</div>
              </div>
            ),
          },
          style: {
            background: "#f8faf2",
            color: "#395438",
            border: `1px solid ${LAYER_COLOR[layer]}`,
            borderRadius: 10,
            padding: 8,
            fontSize: 12,
            minWidth: 110,
            boxShadow: "none",
          },
        });
      });
    }
    for (const layer of [1, 2, 3] as const) {
      out.push({
        id: `layer-label-${layer}`,
        position: { x: -120, y: LAYER_Y[layer] + 10 },
        data: {
          label:
            layer === 1
              ? "① 语言"
              : layer === 2
                ? "② 中间件"
                : "③ 场景",
        },
        style: {
          background: "transparent",
          border: "none",
          color: "#526448",
          fontWeight: 700,
          fontSize: 13,
          width: 90,
        },
        draggable: false,
        selectable: false,
      });
    }
    return out;
  }, []);

  const edges: Edge[] = useMemo(
    () =>
      SUPPORT_EDGES.map((e, i) => ({
        id: `ov-${i}`,
        source: e.from,
        target: e.to,
        label: e.label,
        animated: false,
        style: { stroke: "#849477" },
        labelStyle: { fill: "#59694f", fontSize: 10 },
        labelBgStyle: { fill: "#f8faf2", fillOpacity: 0.92 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: "#849477",
        },
      })),
    [],
  );

  return (
    <div
      className="flow-graph-host overview-flow"
      style={{ height: height ?? undefined, width: "100%" }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        minZoom={0.15}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        colorMode="light"
        ariaLabelConfig={{ "controls.zoomIn.ariaLabel": "放大图谱", "controls.zoomOut.ariaLabel": "缩小图谱", "controls.fitView.ariaLabel": "适应画布" }}
      >
        <Background gap={20} size={1} color="#dce5d1" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(247,249,241,0.8)"
          nodeColor={(n) => {
            if (n.id.startsWith("layer-label")) return "transparent";
            const raw = diagramNodes.find((d) => d.id === n.id);
            return raw ? LAYER_COLOR[raw.layer] : "#77966a";
          }}
        />
      </ReactFlow>
    </div>
  );
}
