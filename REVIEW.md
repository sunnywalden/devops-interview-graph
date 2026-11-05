# Night Briefing · 设计 vs 实现评审闭环

> 对照 `DESIGN.md` §C–G · 2026-11-04 · 评审后已全部落地可行动项

## Checklist

| # | 项（DESIGN） | 结果 | 说明 / 修复 |
|---|--------------|------|-------------|
| 1 | Token：canvas/elevated/card/oral + 琥珀强调 | **PASS** | `main.tsx` + `index.css` 对齐 `#E6A23C` / `#0B0F14` 等 |
| 2 | 无彩虹 Tag 标三层 | **FIXED** | OverviewFlow 层 3 曾用 success 绿 `#3DB88A` → 改为琥珀系青铜 `#A89060` |
| 3 | 口播主舞台（非 Collapse） | **PASS→POLISH** | 结构已对；标题字号改 18px；换卡 `key={card.id}` 轻重置 |
| 4 | 仅追问默认开；原理/易错关 | **FIXED** | `defaultActiveKey` 换卡不重生 → Collapse 加 `key={card.id}` |
| 5 | 图示记住展开 + tab（`devops-kg-ui-prefs`） | **PASS→POLISH** | 读写已通；Tabs `destroyInactiveTabPane` 保证切到可交互时 fitView |
| 6 | 总览只留交互图（无静态卡墙） | **FIXED** | 已无彩虹卡墙；去掉图谱下重复 `Steps`（与图例/短说明重复） |
| 7 | 进度芯片非 Alert；页脚瘦 | **PASS→POLISH** | 页脚已瘦；芯片补相对时间；紧凑态也显示 meta |
| 8 | Callout 左边线、少 Alert | **PASS** | 无 Ant `Alert` 书签/定位 |
| 9 | 粘性工具条 · Select 工具条内全宽 | **FIXED** | Select 去掉 `maxWidth: 520`；工具条实色底防透字 |
| 10 | 舒适密度 24/32、口播 16–17px | **PASS** | oral 16.5px / lh 1.8 / max 46rem |
| 11 | Overview 图例 + 可用高度 | **FIXED** | 响应式高度 `clamp`；图例层色与节点边框一致 |
| 12 | a11y：琥珀对比、focus-visible、跳过图谱 | **FIXED** | 已有 focus-visible；补「跳到追问」锚点；主按钮深字 |
| 13 | 移动端顶栏折行 | **FIXED** | 芯片不再强制整行 order:3；缩小 chip；吸顶 top 仍跟 `--header-h` |
| 14 | 死文案 / 工程黑话 / 死 props | **FIXED** | 去掉 Layer/Overview 未用的 bookmark·onContinue 透传；related 文案保持产品口吻 |
| 15 | 书签 v2 / 卡正文不动 | **PASS** | 未改 `bookmark.ts` 协议与 data 卡正文 |
| 16 | `npm run build` | **PASS** | 见文末 |

## 本轮已交付修复

1. OverviewFlow 层着色全琥珀系（去绿彩虹残留）
2. Collapse / CardView 按 `card.id` remount，追问默认开策略换卡生效
3. DiagramPanel：`destroyInactiveTabPane` + 「跳到追问」；Flow 显式时重新 fitView
4. Overview：移除图谱下重复 Steps；图谱高度响应式；图例色对齐
5. Layer 工具条 Select 全宽；工具条背景实色
6. BookmarkBanner 相对时间；移动端 header/chip 折行优化
7. 卡标题 18px；清理死 props
8. CSS：oral/chip/focus/overview-flow 高度与图例微抛光

## Phase 3（已交付 · 2026-11-04）

| # | 项 | 结果 | 说明 |
|---|-----|------|------|
| P3-1 | 换卡 120–180ms 动效 | **DONE** | `.card-transition` 150–160ms；`prefers-reduced-motion` 关闭 |
| P3-2 | 今日口播焦点模式 | **DONE** | 层页「今日口播」；隐 Menu/Footer；Esc / 顶栏退出；`focusMode` in `devops-kg-ui-prefs` |
| P3-3 | `@media print` 白底口述 | **DONE** | 保留题头+一句话+口播；隐藏导航/图/折叠/芯片 |
| P3-4 | 本层浏览弱进度 | **DONE** | `visitedByPage`；工具条底细进度 `本层 n/total` |

### Prefs keys（`devops-kg-ui-prefs`，向后兼容）

- `diagramExpanded?: boolean`
- `diagramTab?: "mermaid" | "flow"`
- `focusMode?: boolean` — Phase 3
- `visitedByPage?: { lang?: string[]; mid?: string[]; scene?: string[] }` — Phase 3

### 用法

- **焦点**：层页工具条右侧「今日口播」→ 隐导航；Esc 或「退出焦点」退出。
- **打印**：浏览器打印当前卡；只出题干+口播。
- **弱进度**：打开过的卡计入本层细条，与书签 v2 独立。

### 仍可选（非阻断）

- 主包体积（mermaid/elk）进一步拆分（已有 lazy，chunk 告警可忽略）

## Build

`npm run build` → **green**（tsc -b && vite build）
