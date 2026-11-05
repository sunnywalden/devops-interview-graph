# 面试作战台 · DevOps 面试知识图谱（离线版）

从 Cursor Canvas 迁移的**完整离线**前端：Vite + React + TypeScript + **Ant Design 5（暗色）**。打开后可按「语言 → 中间件 → 场景」刷卡；**换页 / 切换 Segmented / 换下拉知识点会立刻写入本机 localStorage**，刷新或下次打开自动落到 Segmented + Select 成对位置，无需聊天助手「记到」。

## 快速开始

```bash
cd devops-interview-graph
npm install
npm run dev          # 开发预览 http://localhost:5173
npm run build        # 产出静态包 dist/
npm run preview      # 本地预览 dist
```

### 完全离线打开

1. 执行 `npm run build`
2. 任选其一：
   - `npx serve dist`（或任意静态服务器指向 `dist/`）
   - 将整个 `dist/` 目录拷到 U 盘 / 另一台机器，用静态服务器打开（推荐）
3. 产物入口：`dist/index.html`（`base: './'`，资源相对路径，便于拷贝）

> 直接用浏览器 `file://` 打开部分环境可能限制 ES module；优先用 `npm run preview` 或 `npx serve dist`。

## 书签 / 进度怎么工作（v2）

| 行为 | 效果 |
|------|------|
| 切换顶栏页（总览 / 语言 / 中间件 / 场景） | 写入 `current` + `byPage[该页]`；若点的是裸 `#/mid`，**恢复该页上次 Segmented+Select**，并 `replaceState` 成完整深链 |
| 切换 Segmented（如 Golang↔Python） | **跳到该组第一张卡**，并保存这一对状态 |
| 换知识点下拉 | 立刻保存当前卡到本页槽位 |
| 刷新 / 关闭再打开 | 读 localStorage；若 URL 带完整 hash 则 **hash 优先**；裸 hash 用 `byPage` |
| 总览「继续上次」 | 跳到全局 `current` 的完整深链 |

- 存储键：`devops-kg-bookmark`
- **v2 结构**（各层独立记忆，互不覆盖）：

```json
{
  "version": 2,
  "current": {
    "page": "lang",
    "primary": "go",
    "topic": "chan",
    "label": "①语言层 · Golang · channel / select",
    "updatedAt": "2026-11-05 20:01"
  },
  "byPage": {
    "lang": { "page": "lang", "primary": "go", "topic": "chan", "label": "…", "updatedAt": "…" },
    "mid": { "page": "mid", "primary": "mongo", "topic": "mongo-idx", "label": "…", "updatedAt": "…" }
  }
}
```

- **v1 → v2 迁移**：启动时若读到旧的扁平 `{ page, primary, topic, label, updatedAt }`，自动升成 `version: 2`，并把该条同时写入 `current` 与 `byPage[page]`。无需手动清缓存。
- 深链示例：`#/lang/go/chan`、`#/mid/mongo/mongo-idx`、`#/scene/cicd/stages`、`#/overview/star/mingfu`
- 验证路径：语言层练到 `go/chan` → 点顶栏进中间件并练到某卡 → 再点 `#/lang` → 应回到 `go/chan`；再进 `#/mid` → 应回到中间件上次那张卡。

清除进度：浏览器开发者工具 → Application → Local Storage → 删掉 `devops-kg-bookmark`。

## 内容结构

卡片库存（加厚后，约数）：

| 层 | 文件 | 卡数 | 分组要点 |
|----|------|------|----------|
| 语言 | `src/data/language.ts` | **23**（Go 12 + Python 11） | Go/Python 并列主语言；补 interface/error/同步/优雅退出/测试/GC；typing/多进程/Poetry/ASGI/标准库 |
| 中间件 | `src/data/middleware.ts` | **26** | MySQL 4、Mongo 4、Redis 4、MQ 3、Docker/K8s 9、DNS/TLS 2 |
| 场景 | `src/data/scenarios.ts` | **28** | CI/CD **8**（原六卡+供应链+Runner）、监控 4、日志 2、运维 3、CMDB 4、报表 1、其他 6 |
| 总览 | `src/data/overview.ts` | STAR×5 + 冲刺 | checklist/sprint 已覆盖新高频点 |
| 校验 | `src/data/validate.ts` | — | 启动断言每组 `defaultTopic` ∈ cards |

每张卡加厚口径：原理约 8–12 条、坑约 4–6、口述约 150–250 字、追问约 4–6 且非一句话。

简历数字只保留原文：**可用性 99.9999%**、**成本约 -40%**。不编造其它指标。

## 技术说明

- **UI: Ant Design 5 暗色**（`antd` + `@ant-design/icons`，`ConfigProvider` + `theme.darkAlgorithm` + `zhCN`）
- **图示**: [Mermaid](https://mermaid.js.org/) 渲染流程图 / 时序图 / 状态图（卡片「图示」页签）
- **交互图谱**: [@xyflow/react](https://reactflow.dev/)（React Flow）可缩放平移的节点图（卡片「交互图谱」页签；总览三层关系图）
- Mermaid 与 React Flow 均 `React.lazy` 按需加载，减小首屏包体
- 无后端、无统计、无运行时 CDN 依赖（系统字体；依赖打进静态包，可完全离线）

### 卡片视觉数据

- 类型：`Card.visuals?: CardVisual[]`，`CardVisual` 为 `mermaid` 或 `flow`
- 图示按 `${groupId}/${cardId}` 写在 `src/data/visuals-*.ts`，经 `attachVisuals` 挂到卡片
- 高频卡（约 60+）带图；偏薄的卡可仍为纯文字
- 内容以 Typed TS 模块内嵌，构建后全部打进静态 JS
- Layout / Menu / Card / Segmented / Select / Alert / Collapse / Descriptions / Row·Col 等 Ant 组件
- 深色可读 UI，手机可刷；顶栏 sticky Header

## 与 Cursor Canvas 的关系

本项目用于**脱离 Canvas / Bot 会话**练习：Canvas 无法跨 Bot 自动恢复 Segmented+Select，本站用 localStorage + hash 补齐。内容自四页 Canvas 迁移，不另起炉灶改口径。

## 评审闭环

本次按设计评审已闭环：

1. **分页书签 v2**：`current` + `byPage`，裸 `#/mid` / `#/lang` / `#/scene` / `#/overview` 恢复该页上次位置，不再被全局书签冲掉。
2. **顶栏 / LinkCards 裸 hash**：不要求 `saved.page === fromHash.page`，一律读 `byPage[page]`；恢复后 `history.replaceState` 写成完整深链。
3. **层页也有进度横幅**：`LayerPage` 显示 compact banner（label + updatedAt）。
4. **切卡滚动**：primary/topic 变化时 `scrollIntoView({ behavior: 'smooth', block: 'start' })` 卡墙。
5. **卫生**：删除空 `src/hooks/`、未用 `hero.png` / `vite.svg`；favicon 改为 `./favicon.svg`；`span-all` 替代内联 grid；`page` prop 用于文案 / scroll key；数据 `defaultTopic` 校验。
6. **无障碍**：顶栏 `aria-label` + `aria-current="page"`；Segmented 可选 `ariaLabel` + 方向键。
7. **继续上次**：总览按钮跳 `current` 完整 hash。
8. **UI 美化**：Ant Design 5 暗色；自定义 Segmented/Select 已替换为 Ant 组件。
