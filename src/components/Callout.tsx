import type { ReactNode } from "react";

/** Left-accent panel — no Ant Alert chrome. */
export function Callout({
  lead,
  tone = "info",
  children,
}: {
  lead: string;
  tone?: "info" | "warn";
  children: ReactNode;
}) {
  return (
    <aside
      className={`callout${tone === "warn" ? " callout--warn" : ""}`}
      role="note"
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="callout__lead">{lead}</div>
        <div className="callout__body">{children}</div>
      </div>
    </aside>
  );
}
