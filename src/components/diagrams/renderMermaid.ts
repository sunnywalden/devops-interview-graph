import type { Mermaid } from "mermaid";

// Mermaid appends temporary SVGs to document.body by default and can leave
// them behind when parsing or loading a diagram engine fails. Own a separate
// container for each queued render, and clean it even after the view unmounts.
export async function renderMermaid(mermaid: Pick<Mermaid, "initialize" | "render">, id: string, source: string) {
  mermaid.initialize({
    startOnLoad: false,
    suppressErrorRendering: true,
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
  const container = document.createElement("div");
  container.setAttribute("data-mermaid-staging", "");
  container.setAttribute("aria-hidden", "true");
  // Keep layout available for SVG measurement, without flashing a second SVG.
  container.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none";
  document.body.appendChild(container);
  try {
    return await mermaid.render(id, source.trim(), container);
  } finally {
    container.remove();
  }
}
