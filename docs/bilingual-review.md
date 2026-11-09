# 中英文实时切换评审

验收日期：2026-11-08。

## 505 组追问逐条复核

按课程顺序逐条对读 101 个知识点下的 505 组问答。每组先核对提问意图，再检查两版回答的术语、机制、适用条件、版本边界和验证方法。运行时机制以语言和产品的官方文档为准。架构、容量和排障类问题按具体场景给出选择条件与验证信号，保留与实现或部署相关的前提。

| 模块 | 已复核 | 对读通过 | 双语修正 | 英文修正 | 中文修正 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 语言基础 | 130 | 96 | 9 | 25 | 0 |
| 中间件与容器 | 225 | 181 | 26 | 17 | 1 |
| 场景实战 | 150 | 127 | 13 | 10 | 0 |
| 合计 | 505 | 404 | 48 | 52 | 1 |

本轮修正包括 Go 1.25 默认 `GOMAXPROCS` 的自动更新条件、Python 3.14 进程启动方式的适用平台，以及自由线程构建与运行时 GIL 状态的区别。[Go 1.25 发布说明](https://go.dev/doc/go1.25) · [Go runtime](https://pkg.go.dev/runtime#GOMAXPROCS) · [Python multiprocessing](https://docs.python.org/3.14/library/multiprocessing.html) · [Python free-threading](https://docs.python.org/3.14/howto/free-threading-python.html)

中间件部分区分了 InnoDB 死锁和锁等待超时的回滚范围、Kafka 事务覆盖的输出记录与消费位点，以及 Kubernetes ConfigMap 在环境变量、普通卷和 `subPath` 下的更新行为。[InnoDB 错误处理](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/innodb-error-handling.html) · [Kafka 设计文档](https://kafka.apache.org/42/design/design/) · [Kubernetes ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/)

场景部分区分了 TLS 证书选择与服务身份校验、DRF 对列表和创建操作的授权边界，以及长短两个窗口同时触发的错误预算消耗速率告警。复核时 Google SRE Workbook 部分原始链接无法访问，相关内容通过 Grafana SLO 和 PagerDuty 事件响应文档交叉核对。失效的事务性发件箱链接已替换为 Azure Architecture Center 的官方文档。[RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html) · [DRF 对象级权限的限制](https://www.django-rest-framework.org/api-guide/permissions/#limitations-of-object-level-permissions) · [Grafana SLO 告警](https://grafana.com/docs/grafana-cloud/observe-and-act/alert-and-measure-reliability/slo/set-up/configure-burn-rate-notifications/#burn-rate-alerts) · [PagerDuty 事件分级](https://response.pagerduty.com/before/severity_levels/) · [PagerDuty 事后复盘](https://response.pagerduty.com/after/post_mortem_process/) · [Azure 事务性发件箱](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos)

下表列号对应每个知识点的五条追问。✓ 表示对读通过，双、英、中分别表示修改了两版、英文版或中文版。各知识点的引用可在课程卡片中查看，链接统一在[引用注册表](../src/data/sources.ts)中维护。

### 语言基础

| 知识点 | 第 1 问 | 第 2 问 | 第 3 问 | 第 4 问 | 第 5 问 |
| --- | --- | --- | --- | --- | --- |
| `go/gmp` GMP 调度 | ✓ | 英 | 双 | 英 | ✓ |
| `go/ctx` context 取消 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `go/chan` channel / select | ✓ | ✓ | ✓ | ✓ | ✓ |
| `go/mem` 竞态·逃逸·pprof | 英 | 英 | 英 | ✓ | 英 |
| `go/gozero` go-zero 服务 | ✓ | ✓ | ✓ | 英 | 英 |
| `go/graphql` GraphQL/多协议 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `go/iface` interface / nil | 双 | ✓ | ✓ | 英 | ✓ |
| `go/errwrap` error wrapping | 双 | 英 | ✓ | ✓ | ✓ |
| `go/syncmap` sync.Map / Mutex | ✓ | ✓ | 双 | ✓ | ✓ |
| `go/graceful` HTTP 优雅退出 | ✓ | ✓ | ✓ | 英 | ✓ |
| `go/gotest` 测试 / 表驱动 | 英 | ✓ | 英 | ✓ | ✓ |
| `go/gc` GC 面试要点 | ✓ | 双 | 英 | ✓ | ✓ |
| `go/gomodel` 内存模型 | ✓ | ✓ | ✓ | ✓ | 英 |
| `go/generics` 泛型边界 | ✓ | ✓ | ✓ | ✓ | 双 |
| `python/gil` GIL | ✓ | 英 | ✓ | ✓ | 双 |
| `python/free-threading` Free-threading / 自由线程 | ✓ | ✓ | ✓ | ✓ | 英 |
| `python/asyncio` asyncio / 协程 | 英 | ✓ | 双 | ✓ | ✓ |
| `python/django` Django 权限多租户 | ✓ | ✓ | ✓ | 英 | ✓ |
| `python/exp` Exporter | ✓ | ✓ | ✓ | 英 | ✓ |
| `python/syntax` 装饰器·生成器 | ✓ | 英 | ✓ | ✓ | ✓ |
| `python/vsgo` Python vs Go | ✓ | ✓ | ✓ | 英 | ✓ |
| `python/typing` typing / Pydantic | ✓ | ✓ | 英 | ✓ | ✓ |
| `python/mp` 多进程 vs 线程 | ✓ | 双 | ✓ | ✓ | ✓ |
| `python/poetry` 打包 / Poetry | ✓ | ✓ | 英 | ✓ | ✓ |
| `python/asgi` WSGI / ASGI | ✓ | ✓ | ✓ | ✓ | ✓ |
| `python/stdlib` 运维常用标准库 | ✓ | 英 | ✓ | ✓ | ✓ |

### 中间件与容器

| 知识点 | 第 1 问 | 第 2 问 | 第 3 问 | 第 4 问 | 第 5 问 |
| --- | --- | --- | --- | --- | --- |
| `mysql/basic` 索引·事务·慢查（基础） | ✓ | ✓ | ✓ | ✓ | ✓ |
| `mysql/with-cache` 与 Redis 协作 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `mysql/isolation` 隔离级别 / MVCC | 双 | ✓ | 英 | 英 | ✓ |
| `mysql/deadlock` 死锁与锁等待 | ✓ | ✓ | ✓ | 双 | ✓ |
| `mysql/repl` 主从与读写分离 | ✓ | 双 | ✓ | 英 | ✓ |
| `mysql/shard` 分库分表 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `mongo/mongo-idx` 索引与两阶段查询 | ✓ | ✓ | 双 | ✓ | ✓ |
| `mongo/mongo-txn` 事务与边界 | 双 | ✓ | 英 | 双 | ✓ |
| `mongo/replica` 副本集 / 写关注 | ✓ | ✓ | ✓ | 双 | ✓ |
| `mongo/schema` 模型 / 嵌入 vs 引用 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `mongo/mongo-shard` 分片集群 | ✓ | ✓ | ✓ | 双 | 双 |
| `mongo/changestream` Change Stream | 英 | ✓ | 英 | ✓ | 英 |
| `redis/redis` 二级缓存与防护 | 英 | ✓ | ✓ | ✓ | ✓ |
| `redis/persist` 持久化 AOF/RDB | 双 | ✓ | ✓ | 双 | ✓ |
| `redis/cluster` Cluster vs Sentinel | ✓ | ✓ | ✓ | ✓ | ✓ |
| `redis/hotkey` 热 key / 大 key | ✓ | ✓ | 双 | ✓ | ✓ |
| `redis/types` 数据结构选型 | ✓ | ✓ | ✓ | 双 | ✓ |
| `redis/distlock` 分布式锁 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `mq/mq` 消息可靠性 | 双 | 英 | ✓ | ✓ | ✓ |
| `mq/backlog` 积压治理 | 英 | ✓ | 英 | ✓ | 双 |
| `mq/ordering` 分区键与顺序 | 中 | 双 | 英 | ✓ | ✓ |
| `mq/choice` MQ 选型对比 | ✓ | ✓ | 英 | ✓ | ✓ |
| `mq/txmsg` 延时与事务消息 | ✓ | 英 | ✓ | ✓ | ✓ |
| `container/arch` K8s 架构与组件 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/workload` Pod 与控制器 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/cni` 网络模型 / CNI | ✓ | 双 | ✓ | 英 | ✓ |
| `container/volume` PV / PVC / 存储类 | ✓ | 双 | ✓ | ✓ | ✓ |
| `container/rbac` RBAC 与 SA | ✓ | 英 | ✓ | ✓ | ✓ |
| `container/isol` 容器隔离 / cgroup | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/docker` Docker 镜像基础 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/probe` 探针与滚动 | 英 | ✓ | ✓ | ✓ | ✓ |
| `container/sched` 调度与资源 | 双 | ✓ | ✓ | ✓ | ✓ |
| `container/cicdlink` 承接 CI 部署 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/config` ConfigMap / Secret | 双 | ✓ | ✓ | ✓ | ✓ |
| `container/svc` Service / Ingress | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/netpol` NetworkPolicy 要点 | ✓ | ✓ | 双 | ✓ | ✓ |
| `container/etcd` etcd 意识 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/troubleshoot` 资源排障更深 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/node` 节点维护 / drain | ✓ | ✓ | 双 | ✓ | ✓ |
| `container/helm` Helm / Kustomize | ✓ | ✓ | ✓ | ✓ | ✓ |
| `container/quota` LimitRange / 配额 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `net/dns` DNS 要点 | ✓ | ✓ | ✓ | 双 | ✓ |
| `net/coredns` CoreDNS 要点 | ✓ | 双 | ✓ | ✓ | ✓ |
| `net/tls` TLS 基础 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `net/cert` 证书生命周期 | ✓ | 双 | ✓ | ✓ | 双 |

### 场景实战

| 知识点 | 第 1 问 | 第 2 问 | 第 3 问 | 第 4 问 | 第 5 问 |
| --- | --- | --- | --- | --- | --- |
| `cicd/stages` stages / jobs / needs | 双 | 双 | ✓ | ✓ | ✓ |
| `cicd/templates` include 模板与变量 | ✓ | ✓ | ✓ | 双 | ✓ |
| `cicd/quality` cache / artifacts / Sonar | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cicd/kaniko` 容器镜像构建 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cicd/mrpipe` MR vs 分支 / Badge | ✓ | ✓ | 双 | ✓ | ✓ |
| `cicd/deploy` CD 一键部署 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cicd/canary` 金丝雀与灰度 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cicd/supply` 供应链安全扫描 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cicd/runners` Runner 标签与容量 | 英 | ✓ | ✓ | ✓ | ✓ |
| `monitor/golden` 黄金信号排障 | ✓ | 双 | ✓ | ✓ | ✓ |
| `monitor/prom` Prometheus 联邦 | 双 | ✓ | ✓ | ✓ | ✓ |
| `monitor/slo` SLO / SLI / 错误预算 | ✓ | ✓ | 双 | ✓ | ✓ |
| `monitor/alertfatigue` 告警疲劳治理 | ✓ | 英 | ✓ | ✓ | ✓ |
| `log/elk` ELK / ILM | ✓ | 双 | ✓ | ✓ | ✓ |
| `log/structured` 结构化日志与链路 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `log/trace` 全链路追踪 | 双 | ✓ | ✓ | ✓ | ✓ |
| `ops/platform` 平台化叙事 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `ops/terraform` Terraform state / lock | ✓ | ✓ | 双 | ✓ | ✓ |
| `ops/gitops` GitOps vs Push CD | ✓ | ✓ | ✓ | ✓ | 双 |
| `cmdb/idem` 幂等 | ✓ | ✓ | ✓ | 英 | ✓ |
| `cmdb/lease` Lease / Fencing | ✓ | 双 | ✓ | ✓ | 英 |
| `cmdb/saga` 流程补偿 | ✓ | ✓ | ✓ | 英 | ✓ |
| `cmdb/worker` 预计算 Worker | ✓ | ✓ | ✓ | ✓ | 英 |
| `report/board` 看板与预计算 | 英 | ✓ | ✓ | ✓ | ✓ |
| `other/nacos` Nacos 配置中心 | 英 | ✓ | ✓ | ✓ | ✓ |
| `other/audit` SQL 审计 | ✓ | ✓ | ✓ | ✓ | 双 |
| `other/backup` 备份恢复 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `other/secrets` 密钥管理 | ✓ | ✓ | ✓ | 英 | ✓ |
| `other/oncall` 故障响应 / Oncall | 英 | ✓ | ✓ | ✓ | ✓ |
| `other/capacity` 容量规划 | ✓ | ✓ | ✓ | ✓ | ✓ |

## 此前的实时切换评审

### 实现范围

- 页头提供「中文 / EN」切换，默认中文；偏好保存到现有 UI 存储并同步同源标签页。
- 覆盖导航、目录、进度说明、专注模式、加载与错误状态、图谱控件和 Ant Design 组件语言；同步文档标题和 `html lang`。
- 英文课程对应全部 101 个知识点、505 条追问回答、原理与易错点、168 个引用标题，以及 84 张课程图示的可见文字。引用 URL 和图示关系沿用原始数据。
- 总览包含双语学习路线、5 个 STAR 经验草稿、3/5 天计划和 16 个知识图谱节点。
- 两种语言随构建一起提供，切换无需联网翻译或刷新页面。

### 设计与评审修正

课程、路由和卡片使用稳定 ID；语言只改变显示内容，不另建一套学习记录。切换语言不重新挂载页面，也不作为新增浏览记录的触发条件。目录保留筛选词，原生展开区域使用稳定键，专注模式和项目、计划选择继续使用现有偏好。

英文内容按完整问题与答案重写，保持原课程的适用条件与版本边界。逐项核对了追问、原理和易错点数量；修正了 Context、Channel、备份一致性、分页、流水线、值班排障和租约问题中的对应关系与措辞。Python Free-threading 保留构建能力与运行时 GIL 状态的区别，以及扩展兼容性和共享状态同步的要求。

图示翻译保留节点 ID 与关系，Mermaid 的中文子图标识改为稳定英文 ID。浏览器回归发现英文标签中的分号会被 Mermaid 解析为语法分隔符，已改为逗号并重新渲染全部图示。总览节点间距按实际节点宽度调整，修复了节点横向重叠；缩放控件与缩略图补充了双语无障碍名称。

### 本轮发现与闭环

| 问题 | 修正与验证 |
| --- | --- |
| 切换后保留了中文筛选词，但英文目录只搜索英文标题，结果消失 | 课程和 STAR 目录按稳定 ID 关联两种语言的搜索别名；切换后保留筛选词、匹配项及输入焦点。支持大小写、全角字符和首尾空格归一化。 |
| 相关链接的 React key 包含翻译标题，切换语言会丢失键盘焦点 | 改用稳定链接地址作为 key；浏览器确认切换后仍聚焦同一链接。 |
| 只读图谱残留英文辅助说明，并提示不支持的删除、移动操作 | 统一图谱、节点、连线、缩放和缩略图的双语辅助文案，明确只读用途，并关闭删除快捷键。 |
| Java 21 引用标题漏译；项目目录沿用知识点专用标题 | 补齐引用标题，目录标题统一为「全部目录 / Full directory」，新增源码字面量翻译覆盖检查。 |
| TaskGroup 表述未区分取消异常；配置热更新缺少跨线程同步条件 | 中英文同步补充首个非 `CancelledError` 异常触发取消、退出时等待，以及 `gather` 的默认异常传播区别；明确共享配置快照及版本需要锁或其他同步协议。 |
| 部分英文术语生硬或含义不明 | 修正多语言架构、项目经历、回归测试与 `sync.Map` 图示措辞，保留技术条件，避免把编程语言混用与界面双语混淆。 |

专业性复核以语言并发语义、Python free-threading、Go 调度、Redis 一致性、幂等与租约等高风险内容为重点，并检查中英文对应关系。全量结构、遗漏和图示关系由自动化检查覆盖；不将此表述为对全部 505 条回答逐句完成人工校对。

技术依据采用官方文档：[Python 3.14 asyncio TaskGroup 与 gather](https://docs.python.org/3.14/library/asyncio-task.html)、[Python free-threading 与共享状态同步](https://docs.python.org/3.14/howto/free-threading-python.html)、[Go 1.25 的 GOMAXPROCS 行为](https://go.dev/doc/go1.25)。

### 验收结果

| 检查 | 结果 |
| --- | --- |
| `npm test` | 35 项通过；包括双语覆盖、章节数量、引用、图示结构、语言持久化、状态隔离、双语目录匹配和只读图谱辅助说明 |
| `npm run lint` | 通过 |
| `npm run build` | 通过 |
| UI 翻译键核对 | 自动扫描 `src` 下全部 TS/TSX 文件的字面量 `t()` 调用；中文键均有英文翻译 |
| 中文 Mermaid 浏览器渲染 | 70 张 SVG，无错误提示、临时容器或根节点外残留 SVG |
| 英文 Mermaid 浏览器渲染 | 70 张 SVG，无错误提示、临时容器或根节点外残留 SVG |
| 课程实时切换 | 当前主题路由、展开回答、原理、专注模式和图谱缩放不变；本轮测试浏览数保持 1/26 |
| 阅读位置与焦点 | Mermaid 高度改变后，追问阅读锚点的位置变化小于 0.2 像素；相关链接、目录筛选框保持焦点，关闭目录后恢复到触发按钮 |
| 刷新与跨标签页 | 恢复语言、专注偏好、路由和浏览数；跨标签页切换后，课程筛选词 `调度` 仍匹配 GMP，项目筛选词 `资源` 仍匹配资源效能/日志 |
| 计划与项目 | 三天计划及展开的准备清单、第二个 STAR 项目及展开的追问在切换后保留 |
| 应用错误日志 | 本轮操作路径未发现浏览器错误 |
| 本地生产构建 | `http://127.0.0.1:5173/` 加载当前构建资源；Free-threading 双语正文、引用、SVG 正常。切换时展开回答、路由和原有 11/26 浏览记录保持不变，刷新后语言与路由恢复，无浏览器错误 |

浏览器检查使用本地 Vite 开发服务和真实 Mermaid/React Flow。14 张课程交互图的中英文拓扑一致性由测试覆盖，浏览器检查了代表性交互图及总览；没有声称逐张完成全部交互图的人工操作。生产构建仍有 Mermaid/ELK 等依赖的大分块提示，构建成功。

此前已验证 1280、390、320 像素宽度无页面水平溢出，且总览 16 个节点无重叠。本轮未调整布局样式，以上作为既有布局基线，不计为本轮重新执行的检查。上述评审发现均已修复，无未闭环的阻断项。

## 后续维护约定

修改课程时同步维护 `src/i18n/*.en.ts`，保持卡片、分组和节点 ID 不变。新增界面文字补充 `src/i18n/ui.ts`；新增图示文字补充 `src/i18n/visuals.ts`，并在 `/tests/mermaid-browser.html` 分别运行中文和英文全量渲染检查。浏览记录在两个语言版本间共享，始终只表示打开过，不表示掌握。
