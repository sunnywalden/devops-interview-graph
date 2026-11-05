import { useEffect, useId, useState } from "react";
import { Spin } from "antd";

type Props = {
  source: string;
  className?: string;
};

export function MermaidBlock({ source, className }: Props) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setErr(null);

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Noto Sans SC", sans-serif',
          flowchart: { htmlLabels: true, curve: "basis" },
          themeVariables: {
            darkMode: true,
            background: "#0B0F14",
            primaryColor: "#161E29",
            primaryTextColor: "#E8EEF4",
            primaryBorderColor: "#E6A23C",
            secondaryColor: "#121821",
            tertiaryColor: "#0B0F14",
            lineColor: "#8B9BB0",
            textColor: "#E8EEF4",
            mainBkg: "#161E29",
            nodeBorder: "#E6A23C",
            clusterBkg: "#121821",
            clusterBorder: "rgba(255,255,255,0.12)",
            titleColor: "#E8EEF4",
            edgeLabelBackground: "#121821",
            nodeTextColor: "#E8EEF4",
          },
        });
        const renderId = `mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg: out } = await mermaid.render(renderId, source.trim());
        if (!cancelled) setSvg(out);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : String(e));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, reactId]);

  if (err) {
    return (
      <div
        className="callout callout--warn"
        role="alert"
        style={{ marginBottom: 0 }}
      >
        <div>
          <div className="callout__lead">图示渲染失败</div>
          <div className="callout__body">{err}</div>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin tip="渲染图示…" />
      </div>
    );
  }

  return (
    <div
      className={className ?? "mermaid-host"}
      // Mermaid returns trusted SVG from our own source strings (offline data).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
