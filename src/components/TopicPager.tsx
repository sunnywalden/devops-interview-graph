import { useLocale } from "../i18n/useLocale";
import { useId, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { CloseOutlined } from "@ant-design/icons";
import { filterDirectory, type DirectoryItem } from "../i18n/directory";

export type TopicPagerItem = DirectoryItem;

type IndexedItem = TopicPagerItem & { index: number };

function focusable(root: HTMLElement): HTMLElement[] {
  return [
    ...root.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), a[href], [tabindex]",
    ),
  ].filter((el) => !el.hasAttribute("disabled") && el.tabIndex >= 0);
}

/**
 * Named previous/next destinations and an explicit position, plus a directory.
 */
export function TopicPager({
  items,
  value,
  onChange,
  ariaLabel,
  scopeLabel,
  filterPlaceholder,
}: {
  items: TopicPagerItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  scopeLabel?: string;
  filterPlaceholder?: string;
}) {
  const { t } = useLocale();
  const reactId = useId();
  const dialogId = `topic-dir-${reactId.replace(/:/g, "")}`;
  const titleId = `${dialogId}-title`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  useLayoutEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  });

  const index = items.findIndex((item) => item.id === value);
  const safeIndex = index >= 0 ? index : 0;
  const current = items[safeIndex];
  const total = items.length;

  const indexed = useMemo<IndexedItem[]>(
    () => items.map((item, itemIndex) => ({ ...item, index: itemIndex })),
    [items],
  );
  const visible = filterDirectory(indexed, query);

  const openFrom = (el: HTMLElement) => {
    openerRef.current = el;
    setQuery("");
    setOpen(true);
  };

  const close = () => setOpen(false);

  const pick = (id: string) => {
    setOpen(false);
    if (id !== value) onChange(id);
  };

  const step = (delta: number) => {
    const next = items[safeIndex + delta];
    if (!next) return;
    onChange(next.id);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const rootEl = document.getElementById("root");
    if (rootEl) rootEl.setAttribute("inert", "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel || e.isComposing) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const itemsToFocus = focusable(panel);
        if (itemsToFocus.length === 0) {
          e.preventDefault();
          return;
        }
        const first = itemsToFocus[0];
        const last = itemsToFocus[itemsToFocus.length - 1];
        const active = document.activeElement;
        const inside = active instanceof Node && panel.contains(active);
        if (!inside) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
          return;
        }
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }

      const active = document.activeElement;
      const inFilter = active === filterRef.current;
      const options = [
        ...panel.querySelectorAll<HTMLButtonElement>(".topic-dir__item"),
      ];

      if (e.key === "ArrowDown") {
        if (inFilter) {
          e.preventDefault();
          options[0]?.focus();
        } else if (active instanceof HTMLButtonElement && options.includes(active)) {
          const at = options.indexOf(active);
          if (at >= 0 && at < options.length - 1) {
            e.preventDefault();
            options[at + 1].focus();
          }
        }
        return;
      }

      if (e.key === "ArrowUp") {
        if (!(active instanceof HTMLButtonElement) || !options.includes(active)) {
          return;
        }
        const at = options.indexOf(active);
        e.preventDefault();
        if (at <= 0) filterRef.current?.focus();
        else options[at - 1].focus();
        return;
      }

      if ((e.key === "Home" || e.key === "End") && !inFilter) {
        if (!(active instanceof Node) || !panel.contains(active)) return;
        e.preventDefault();
        const target = e.key === "Home" ? options[0] : options[options.length - 1];
        target?.focus();
        return;
      }

      if (e.key === "Enter" && inFilter) {
        const q = filterRef.current?.value.trim() ?? "";
        const id = options[0]?.dataset.topicId;
        if (!q || !id) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        if (id !== valueRef.current) onChangeRef.current(id);
      }
    };

    window.addEventListener("keydown", onKey, true);
    filterRef.current?.focus({ preventScroll: true });

    return () => {
      window.removeEventListener("keydown", onKey, true);
      if (rootEl) rootEl.removeAttribute("inert");
      document.body.style.overflow = prevOverflow;
      if (openerRef.current?.isConnected) {
        openerRef.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>("[data-current='true']");
    if (!list || !row) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const delta =
      rowRect.top - listRect.top - (list.clientHeight - rowRect.height) / 2;
    list.scrollTop += delta;
  }, [open, value]);

  if (!current) return null;
  const n = safeIndex + 1;
  const placeholder = filterPlaceholder ?? t("筛选{name}", { name: ariaLabel });

  return (
    <>
      <div
        className="topic-pager"
        role="group"
        aria-label={ariaLabel}
        data-topic-pager=""
      >
        <div className="topic-pager__row">
          <div className="topic-pager__current" aria-live="polite" aria-atomic="true">
            <span className="topic-pager__pos">{scopeLabel && `${scopeLabel} · `}{t("第 {n} / {total} 个{name}", { n, total, name: ariaLabel })}</span>
            <strong className="topic-pager__name">{current.label}</strong>
          </div>
          <button
            type="button"
            className="topic-pager__dir"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={dialogId}
            onClick={(e: MouseEvent<HTMLButtonElement>) => openFrom(e.currentTarget)}
          >{t("全部目录 · {total}", { total })}
          </button>
        </div>
        <div className="topic-pager__steps">
          <button
            type="button"
            className="topic-pager__step"
            disabled={safeIndex <= 0}
            onClick={() => step(-1)}
          >
            <span className="topic-pager__arrow" aria-hidden="true">←</span>
            <span className="topic-pager__destination">
              <span>{t("上一个{name}", { name: ariaLabel })}</span>
              <strong>{items[safeIndex - 1]?.label ?? t("已是本组第一项")}</strong>
            </span>
          </button>
          <button
            type="button"
            className="topic-pager__step topic-pager__step--next"
            disabled={safeIndex >= total - 1}
            onClick={() => step(1)}
          >
            <span className="topic-pager__destination">
              <span>{t("下一个{name}", { name: ariaLabel })}</span>
              <strong>{items[safeIndex + 1]?.label ?? t("已是本组最后一项")}</strong>
            </span>
            <span className="topic-pager__arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      {open &&
        createPortal(
        <div
          className="topic-dir-root"
          data-topic-directory=""
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={panelRef}
            id={dialogId}
            className="topic-dir"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="topic-dir__head">
              <div className="topic-dir__head-copy">
                <h2 id={titleId} className="topic-dir__title">{t("目录")}</h2>
                <p className="topic-dir__scope">
                  {scopeLabel ? `${scopeLabel} · ` : ""}
                  {t("共 {total} 项", { total })}
                </p>
              </div>
              <button
                type="button"
                className="topic-dir__close"
                aria-label={t("关闭目录")}
                onClick={close}
              >
                <CloseOutlined aria-hidden="true" />
              </button>
            </div>
            <div className="topic-dir__filter-wrap">
              <input
                ref={filterRef}
                className="topic-dir__filter"
                value={query}
                placeholder={placeholder}
                aria-label={placeholder}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="search"
                onChange={(e) => setQuery(e.target.value)}
              />
              <p
                className="topic-dir__meta"
                aria-live={query.trim() ? "polite" : undefined}
              >
                {query.trim() ? t("{count} 个匹配", { count: visible.length }) : t("点一项即可跳转")}
              </p>
            </div>
            {visible.length === 0 ? (
              <p className="topic-dir__empty" role="status">{t("没有匹配的内容")}
              </p>
            ) : (
              <ul ref={listRef} className="topic-dir__list">
                {visible.map((item) => {
                  const on = item.id === current.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={
                          on ? "topic-dir__item is-current" : "topic-dir__item"
                        }
                        data-topic-id={item.id}
                        data-current={on ? "true" : undefined}
                        aria-current={on ? "true" : undefined}
                        onClick={() => pick(item.id)}
                      >
                        {on ? <span className="topic-dir__bar" aria-hidden="true" /> : null}
                        <span className="topic-dir__label">{item.label}</span>
                        <span className="topic-dir__idx">{item.index + 1}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
