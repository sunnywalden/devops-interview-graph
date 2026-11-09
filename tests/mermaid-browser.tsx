import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import { MermaidBlock } from "../src/components/diagrams/MermaidBlock";
import "../src/index.css";

const sources = {
  invalid: "sequenceDiagram\n  This is not a valid sequence statement",
  valid: "sequenceDiagram\n  participant G\n  participant M\n  G->>M: 调度\n  M-->>G: 完成",
};

export function Harness() {
  const [mode, setMode] = useState<keyof typeof sources | "hidden">("invalid");
  return (
    <main style={{ padding: 24 }}>
      <h1>Mermaid 回归验证</h1>
      <nav aria-label="验证场景" style={{ display: "flex", gap: 16 }}>
        <button onClick={() => setMode("invalid")}>错误图示</button>
        <button onClick={() => setMode("valid")}>正常图示</button>
        <button onClick={() => setMode("hidden")}>卸载图示</button>
      </nav>
      {mode !== "hidden" && [0, 1].map((index) => (
        <section key={`${mode}-${index}`} style={{ marginTop: 24 }}>
          <MermaidBlock source={sources[mode]} />
        </section>
      ))}
      <footer>页面底部：此处之后不应出现图示或错误 SVG。</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><ConfigProvider wave={{ disabled: true }}><Harness /></ConfigProvider></StrictMode>,
);
