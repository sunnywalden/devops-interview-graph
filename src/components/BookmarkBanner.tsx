import { Button } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import type { Bookmark, PageId } from "../types";

/** Parse bookmark stamp → short relative label (America/Los_Angeles wall clock stamps). */
function relativeStamp(stamp: string): string {
  if (!stamp || stamp === "初始" || stamp === "迁移") return stamp;
  const m = stamp.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return stamp;
  const then = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
  ).getTime();
  if (Number.isNaN(then)) return stamp;
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} 天前`;
  return stamp.slice(5, 16);
}

/** Compact progress chip — replaces Alert-based bookmark banner. */
export function BookmarkBanner({
  bookmark,
  onContinue,
  compact = false,
  activePage,
  className,
}: {
  bookmark: Bookmark | null;
  onContinue: () => void;
  compact?: boolean;
  activePage?: PageId;
  className?: string;
}) {
  const showContinue =
    !!bookmark && (!compact || !activePage || bookmark.page !== activePage);

  if (!bookmark) {
    return (
      <div
        className={`progress-chip progress-chip--empty ${className ?? ""}`.trim()}
        role="status"
      >
        <span className="progress-chip__label">尚未记录进度 · 换卡后自动保存</span>
      </div>
    );
  }

  const when = relativeStamp(bookmark.updatedAt);

  return (
    <div className={`progress-chip ${className ?? ""}`.trim()} role="status">
      <span className="progress-chip__label" title={bookmark.label}>
        {compact ? bookmark.label : `上次：${bookmark.label}`}
      </span>
      <span className="progress-chip__meta" title={bookmark.updatedAt}>
        {when}
      </span>
      {showContinue && (
        <Button
          type="primary"
          size="small"
          className="progress-chip__btn"
          icon={<PlayCircleOutlined />}
          onClick={onContinue}
        >
          继续
        </Button>
      )}
    </div>
  );
}
