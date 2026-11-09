import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import { MermaidBlock } from "../src/components/diagrams/MermaidBlock";
import { languageGroups } from "../src/data/language";
import { middlewareGroups } from "../src/data/middleware";
import { scenarioGroups } from "../src/data/scenarios";
import { localizeVisual } from "../src/i18n/visuals";
import "../src/index.css";

const sources = {
  invalid: "sequenceDiagram\n  This is not a valid sequence statement",
  valid: "sequenceDiagram\n  participant G\n  participant M\n  G->>M: 调度\n  M-->>G: 完成",
};

const curriculumDiagrams = [...languageGroups, ...middlewareGroups, ...scenarioGroups]
  .flatMap((group) => group.cards.flatMap((card) =>
    (card.visuals ?? []).filter((visual) => visual.kind === "mermaid")
      .map((visual, index) => ({ id: `${group.id}/${card.id}/${index}`, ...visual })),
  ));

export function Harness() {
  const [mode, setMode] = useState<keyof typeof sources | "hidden" | "all" | "english">("invalid");
  return (
    <main style={{ padding: 24 }}>
      <h1>Mermaid 回归验证</h1>
      <nav aria-label="验证场景" style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <button onClick={() => setMode("invalid")}>错误图示</button>
        <button onClick={() => setMode("valid")}>正常图示</button>
        <button onClick={() => setMode("hidden")}>卸载图示</button>
        <button onClick={() => setMode("all")}>核验全部课程图示</button>
        <button onClick={() => setMode("english")}>Verify all English diagrams</button>
      </nav>
      {(mode === "invalid" || mode === "valid") && [0, 1].map((index) => (
        <section key={`${mode}-${index}`} style={{ marginTop: 24 }}>
          <MermaidBlock source={sources[mode]} />
        </section>
      ))}
      {(mode === "all" || mode === "english") && <section aria-label="全部课程图示">
        <p>共 {curriculumDiagrams.length} 张 Mermaid 图示；每张均应显示 SVG，且没有错误提示或遗留渲染容器。</p>
        {curriculumDiagrams.map((visual) => <section key={visual.id} style={{ marginTop: 24 }}>
          <h2>{visual.id} · {visual.title}</h2>
          <MermaidBlock source={mode === "english" ? (localizeVisual(visual) as typeof visual).source : visual.source} />
        </section>)}
      </section>}
      <footer>页面底部：此处之后不应出现图示或错误 SVG。</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><ConfigProvider wave={{ disabled: true }}><Harness /></ConfigProvider></StrictMode>,
);
