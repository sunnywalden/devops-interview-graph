# DevOps 面试研习室

支持中英文实时切换的温暖浅色离线学习工作台，按「语言基础 → 中间件与容器 → 场景实战」练习知识与表达。使用 React、TypeScript、Vite 和 Ant Design；无后端、统计服务或运行时 CDN，构建产物包含双语内容与依赖并使用系统字体。

## 开发与验证

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

`npm test` 使用 Node 内置测试运行器和项目已有 Vite 加载器，覆盖书签迁移、路由校验、偏好记忆、浏览记录去重、损坏数据、存储失败与恢复、跨标签通知、双语课程与引用完整性、语言切换的状态隔离及图示失败清理。测试使用独立的临时缓存，不会使正在运行的开发服务依赖失效。

浏览器图示回归：开发服务运行时打开 `/tests/mermaid-browser.html`。默认两张错误图示应仅在各自区域显示提示，页脚后没有错误 SVG；点击「正常图示」应显示两张时序图，点击「卸载图示」后不应留下图示。点击「核验全部课程图示」或「Verify all English diagrams」，分别检查中文和英文的全部 70 张 Mermaid 图示，均应生成 SVG 且没有错误提示。这一页面使用真实 Mermaid 与 React StrictMode，不包含在生产构建中。

构建结果在 `dist/`，资源采用相对路径。复制整个目录后通过静态服务器打开即可；直接使用 `file://` 可能受到浏览器 ES module 限制。首次安装依赖需要网络。Mermaid 的部分按需加载图形引擎仍会触发构建的大分块提示。

## 界面与练习

- 双语：页头「中文 / EN」即时切换界面、课程正文、追问、图示、项目与计划，无需刷新或联网翻译。保留当前主题、展开的回答和专注模式；默认中文，选择后记住语言偏好并同步同源标签页。两种语言共用同一份浏览记录，切换语言不增加进度。
- 总览：继续上次学习、三个学习层级、DevOps 开发 / Go 后端 / Python 后端三条岗位起步路线、真实浏览进度、五个 STAR 经验草稿、3/5 天冲刺计划和知识图谱。
- 课程页：分组切换、带目标名称的大按钮翻页与可筛选目录；页尾提示本组后续内容并可继续下一组；浏览记录仅表示打开，不代表学完或掌握；先读核心回答与适用范围，再展开追问、原理、易错点和图示，页尾提供官方参考资料。
- 专注口述：收起导航和辅助内容；退出按钮或 Esc 返回，输入法组合输入期间不抢占 Esc。
- 键盘：聚焦卡片区域或翻页导航后，左右方向键或 j/k 切卡，Home/End 到首尾；目录支持筛选、方向键、Enter 和 Esc。表单、分组选择和目录保留自身键盘行为。
- 图示：Mermaid 与 React Flow 按需加载；图谱可平移并使用控件缩放，滚轮保留页面滚动。图示加载失败时仅在卡片内提示，可刷新重试；临时渲染容器始终清理，正文继续可读。
- 布局适配桌面、平板和手机，提供跳到正文、可见焦点和减少动态效果支持。

## 书签与阅读记录

| 入口或动作 | 行为 |
| --- | --- |
| 首次打开 | 显示学习总览 |
| 无 hash 再次打开 | 恢复最近保存的位置 |
| 完整深链 | URL 优先；无效分组或知识点先校验，再回退并保存有效位置 |
| `#/lang`、`#/mid`、`#/scene` | 恢复该层上次位置 |
| `#/overview` | 打开总览的学习路线 |
| `#/overview/star`、`#/overview/plan` | 恢复项目或计划各自的选择 |
| 切换课程分组 | 打开该组默认知识点 |
| 总览「继续上次学习」 | 打开最近有效的课程知识点，排除总览自身 |

书签存储于 `devops-kg-bookmark`，v2 格式保留 `current` 和独立的 `byPage` 槽位，兼容旧版扁平书签。`devops-kg-ui-prefs` 保存语言、专注模式、图示偏好、项目与冲刺选择、各层已浏览卡片。进度只统计仍存在的不同知识点，表示浏览足迹，不表示掌握程度。

同一浏览器的其他标签页更新记录后，概况会同步。存储被禁用或空间不足时，页面继续保留当前会话的数据，并显示「本次会话暂存」；刷新可能丢失这些尚未落盘的数据。成功再次写入相应存储项后恢复持久保存。

清除全部记录：在浏览器开发者工具的 Local Storage 中删除上述两个键，再刷新。示例深链：`#/lang/go/chan`、`#/overview/star/mingfu`、`#/overview/plan/3d`。

## 内容与代码

| 内容 | 文件 | 数量 |
| --- | --- | --- |
| 语言基础 | `src/data/language.ts`、`src/data/go-backend.ts`、`src/data/python-backend.ts`、`src/data/shell.ts` | 49 张 |
| 中间件与容器 | `src/data/middleware.ts` 及其主题文件 | 73 张 |
| 场景实战 | `src/data/scenarios.ts`、`src/data/platform-practice.ts`、`src/data/backend-api.ts` | 37 张 |
| 项目与冲刺 | `src/data/overview.ts` | 5 个 STAR 经验草稿、3/5 天计划 |
| 官方参考资料 | `src/data/sources.ts` | 363 条引用 |
| 英文课程与总览 | `src/i18n/*.en.ts` 及上表中的双语主题文件 | 对应全部 159 张卡片、795 组追问与回答、项目与计划 |
| 界面与图示翻译 | `src/i18n/ui.ts`、`src/i18n/visuals.ts` | 界面、引用标题与全部 84 张课程图示 |

课程合计 23 组、159 张卡片、795 组双语追问与回答，按定义、机制、适用条件、工程取舍与验证方法组织。各组的核心考点和补充内容见 [岗位考点覆盖盘点](docs/curriculum-coverage.md)，版本依据见 [课程复审记录](docs/curriculum-review.md)。图示定义位于 `src/data/visuals-*.ts`，包括 70 张 Mermaid 图示与 14 张交互图，经 `attachVisuals` 挂载。

Shell 覆盖参数展开、退出状态与运维脚本。中间件与容器包括 ELK 日志链路、Prometheus 抓取与告警、GitLab CI/CD 和 Jenkins Pipeline，以及 Linux 与 PostgreSQL 独立分组。MySQL 默认打开 InnoDB 引擎与索引组织（`#/mid/mysql/innodb`），随后学习事务日志、崩溃恢复和联合索引的执行计划。

Python 共 22 个知识点，含独立的 Free-threading 专题（`#/lang/python/free-threading`）。区分 CPython 3.13 的实验性支持、3.14 正式支持的可选构建和 3.15 新增的自由线程稳定 ABI，覆盖启用与检测、C 扩展兼容性、共享状态同步、并发方案取舍和迁移验证。

编辑内容时保持已有分组与卡片 ID 稳定，以兼容书签和阅读记录。每张卡片必须提供完整回答与 `sources`；引用在 `src/data/sources.ts` 集中维护。存在实现、版本或部署条件差异时，在正文及 `scope` 中明确条件。官方资料用于核对技术知识；项目关联和 STAR 草稿需由本人按实际职责、代码和运行数据补全，不将参考方案或未经核实的数字写成个人成果。阅读内置课程无需网络，打开外部参考资料需要网络。

变更课程时同步维护中英文，逐项核对追问、原理、易错点和版本边界；英文内容通过稳定 ID 对应原课程，复用引用 URL 和图示结构。新增图示文字须补齐 `src/i18n/visuals.ts` 并运行双语浏览器渲染回归，避免仅替换文字后破坏 Mermaid 语法。双语覆盖、状态保持和浏览器验收见 [双语评审记录](docs/bilingual-review.md)。

路由规范化位于 `src/routing.ts`；学习概况由 `src/study.ts` 根据真实课程与书签计算；`src/storage.ts` 和 `src/useSavedState.ts` 负责持久存储降级及订阅。状态回归测试在 `tests/study-state.test.mjs`；内容、引用、图示结构及原有深链检查在 `tests/content.test.mjs`，实际 Mermaid 渲染由上述浏览器页面验证。
