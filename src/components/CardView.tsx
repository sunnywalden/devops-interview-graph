import { useId, useState, type ReactNode } from "react";
import {
  AlertOutlined,
  BookOutlined,
  CommentOutlined,
  QuestionCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { Card as CardType } from "../types";
import { Callout } from "./Callout";
import { DiagramPanel } from "./diagrams/DiagramPanel";

export function CardView({ card }: { card: CardType }) {
  return (
    <div className="card-stack">
      {card.warning && (
        <Callout lead="诚实边界" tone="warn">
          {card.warning}
        </Callout>
      )}

      <header className="stage-card card-head print-keep">
        <p className="card-head__kicker eyebrow">FIELD NOTES / 知识点</p>
        <h2 className="card-head__title">{card.label}</h2>
        <p className="card-head__one">{card.oneLiner}</p>
        <p className="card-head__resume print-hide">
          <span className="card-head__resume-tag">简历锚点</span>
          <span className="card-head__resume-text">{card.resumeAnchor}</span>
        </p>
      </header>

      <section className="stage-card oral-hero print-keep" aria-label="60–90 秒口述">
        <div className="oral-hero__label">
          <span><CommentOutlined aria-hidden="true" /> 60–90 秒口述</span>
          <span className="eyebrow">SPEAK IT OUT</span>
        </div>
        <div className="oral-block">{card.oral}</div>
      </section>

      <div className="print-hide">
        <DiagramPanel visuals={card.visuals} />
      </div>

      <section
        id="card-followups"
        className="followups print-hide"
        aria-label="追问"
        tabIndex={-1}
      >
        <div className="section-label">
          <QuestionCircleOutlined aria-hidden="true" />
          <span>追问</span>
          <span className="section-label__count">{card.followUps.length}</span>
          <span className="section-label__hint">先想一想，再展开答案</span>
        </div>
        <div className="qa-list">
          {card.followUps.map((f, i) => (
            <details key={`${card.id}-fu-${i}`} className="qa-card">
              <summary className="qa-card__row">
                <span className="qa-mark" aria-hidden>
                  Q
                </span>
                <span className="qa-card__q">{f.q}</span>
                <RightOutlined aria-hidden="true" className="qa-chevron" />
              </summary>
              <div className="qa-card__row">
                <span className="qa-mark qa-mark--a" aria-hidden>
                  A
                </span>
                <p className="qa-card__a">{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <Disclosure
        title="原理"
        icon={<BookOutlined aria-hidden="true" />}
        count={card.principles.length}
      >
        <ol className="note-list">
          {card.principles.map((p, i) => (
            <li key={`${card.id}-pr-${i}`}>{p}</li>
          ))}
        </ol>
      </Disclosure>

      <Disclosure
        title="易错"
        icon={<AlertOutlined aria-hidden="true" />}
        count={card.pitfalls.length}
      >
        <ul className="note-list note-list--plain">
          {card.pitfalls.map((p, i) => (
            <li key={`${card.id}-pit-${i}`}>{p}</li>
          ))}
        </ul>
      </Disclosure>
    </div>
  );
}

function Disclosure({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
}) {
  const uid = useId();
  const panelId = `disclosure-${uid}`;
  const [open, setOpen] = useState(false);

  return (
    <section className={`disclosure print-hide${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="disclosure__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <RightOutlined aria-hidden="true" className="disclosure__chevron" />
        <span className="disclosure__icon">{icon}</span>
        <span>{title}</span>
        <span className="disclosure__count">{count}</span>
      </button>
      <div
        className="disclosure__panel"
        id={panelId}
        role="region"
        aria-label={title}
        aria-hidden={!open}
        hidden={!open}
      >
        <div className="disclosure__panel-inner">{children}</div>
      </div>
    </section>
  );
}
