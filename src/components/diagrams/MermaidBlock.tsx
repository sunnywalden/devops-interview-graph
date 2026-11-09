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

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Noto Sans SC", sans-serif',
          flowchart: { htmlLabels: true, curve: "basis" },
          themeVariables: {
            darkMode: false,
            background: "#f7f9f1",
            primaryColor: "#edf2e4",
            primaryTextColor: "#395438",
            primaryBorderColor: "#8da479",
            secondaryColor: "#f8faf2",
            tertiaryColor: "#f7f9f1",
            lineColor: "#7e926e",
            textColor: "#395438",
            mainBkg: "#edf2e4",
            nodeBorder: "#8da479",
            clusterBkg: "#f8faf2",
            clusterBorder: "#cddbc0",
            titleColor: "#395438",
            edgeLabelBackground: "#f8faf2",
            nodeTextColor: "#395438",
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
        <Spin aria-label="渲染图示" />
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
