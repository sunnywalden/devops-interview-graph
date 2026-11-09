import { useEffect, useId, useState } from "react";
import { Button, Spin } from "antd";
import { renderMermaid } from "./renderMermaid";

type Props = {
  source: string;
  className?: string;
};

export function MermaidBlock({ source, className }: Props) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (cancelled) return;
        const renderId = `mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg: out } = await renderMermaid(mermaid, renderId, source);
        if (!cancelled) setSvg(out);
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, reactId]);

  if (failed) {
    return (
      <div
        className="callout callout--warn"
        role="alert"
        style={{ marginBottom: 0 }}
      >
        <div>
          <div className="callout__lead">图示渲染失败</div>
          <div className="callout__body">
            图示暂时无法加载，可以刷新页面后重试。正文仍可继续阅读。
          </div>
          <Button size="small" onClick={() => window.location.reload()}>
            刷新页面
          </Button>
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
