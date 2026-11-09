# 学习内容评审与重构

评审日期：2026-11-08（America/Los_Angeles）。

## 范围与表达原则

本次重写语言基础 25 张、中间件与容器 45 张、场景实战 30 张卡片，共 100 个核心回答及 500 条追问回答，同时校正原理、易错点、项目关联、69 张 Mermaid 图示和 14 张交互图。总览、5 个 STAR 经验草稿和冲刺计划同步修订。

以语言规范、标准库、项目维护者及厂商官方文档为主要依据，参考其术语、条件说明和因果关系，用中文重新组织回答。核心回答先说明定义与机制，再说明适用条件和工程取舍；排障类回答给出观察对象、判断依据和验证方法。移除含糊的口语比喻、未经限定的保证，以及缺乏依据的个人成果。

## 主要问题与修正

| 主题 | 发现的问题 | 已落实的修正与依据 |
| --- | --- | --- |
| Go 调度 | 将运行时调度与线程池混为一谈；把阻塞系统调用描述为必然新建线程 | 区分 G、M、P 与业务并发控制；说明 P 的接管和网络轮询，区分 Java 平台线程与虚拟线程。依据 [Go runtime](https://go.dev/src/runtime/HACKING)、[Java 21 虚拟线程](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)。 |
| GOMAXPROCS 与泄漏 | 默认并行度缺少版本条件；把 goroutine 数量回落视为修复证明 | 明确 Go 1.25 容器感知默认值及兼容设置；通过相同负载、多轮任务和重复等待堆栈验证泄漏。依据 [Go 1.25](https://go.dev/doc/go1.25)、[Go Diagnostics](https://go.dev/doc/diagnostics)。 |
| context、channel、内存模型 | 混淆取消通知与强制终止，忽略共享数据的同步责任 | 补充协作取消、超时后的未知提交状态，以及 channel、锁和原子的同步边界。依据 [context](https://pkg.go.dev/context)、[Go Memory Model](https://go.dev/ref/mem)。 |
| CPython GIL | 将特定实现与构建方式的行为概括为所有 Python | 区分默认启用 GIL 的 CPython 与 3.13 起的自由线程构建，说明扩展兼容性；区分线程、进程与异步 I/O 的用途。依据 [threading](https://docs.python.org/3/library/threading.html)、[Free-threading HOWTO](https://docs.python.org/3/howto/free-threading-python.html)。 |
| Python 进程与 asyncio | 进程启动默认值过时；把 await 当作必然让出执行权 | 按平台限定 Python 3.14 的启动方式，说明事件循环与可等待对象，区分 TaskGroup 和 gather 的失败行为。依据 [multiprocessing 3.14](https://docs.python.org/3.14/library/multiprocessing.html)、[asyncio Tasks](https://docs.python.org/3/library/asyncio-task.html)。 |
| Django 与 DRF | 将 ASGI 等同于整条调用链异步，忽略列表接口的对象授权 | 标注 Django 5.2 异步事务边界；说明权限检查与 QuerySet 过滤的不同责任。依据 [Django async](https://docs.djangoproject.com/en/5.2/topics/async/)、[DRF Permissions](https://www.django-rest-framework.org/api-guide/permissions/)。 |
| MySQL | 混淆快照读与锁定读，夸大半同步复制及 GTID 的保证 | 限定 InnoDB 隔离语义，明确事务重试、未知提交结果和复制接收与应用的区别。依据 [隔离级别](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/innodb-transaction-isolation-levels.html)、[半同步复制](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/replication-semisync.html)。 |
| MongoDB | 将 majority 读取等同于最新读取，缺少写后读的完整条件 | 补齐因果一致会话、majority 读写关注及顺序执行条件；区分事务回调重试和外部副作用。依据 [因果一致性与读写关注](https://www.mongodb.com/docs/manual/core/causal-consistency-read-write-concerns/)。 |
| Redis | 暗示持久化或主从切换不会丢失写入，锁令牌与隔离令牌混用 | 按刷盘和异步复制条件解释数据风险；区分锁所有权校验与资源端单调 fencing 校验。依据 [Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)、[Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)。 |
| 消息系统 | 将事务消息、可靠投递和业务恰好一次混为一谈 | 分开说明生产确认、消息存储、消费确认与业务幂等；限定事务消息及 exactly-once 的协调范围。依据 [Kafka Design](https://kafka.apache.org/42/design/design/)、[RocketMQ 事务消息](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage/)。 |
| Kubernetes | 混淆存活与就绪，过度概括存储访问模式及发布保护 | 校正探针失败的作用；区分 RWO 的节点约束和 RWOP 的 Pod 约束；说明 PDB 与 Deployment 更新策略的不同边界。依据 [Probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)、[Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)。 |
| 容器构建 | 将历史工具视为当前默认方案 | 标明原 Google Kaniko 仓库已归档，区分历史经验与当前维护的构建方案；保留原 `kaniko` 路由，显示名称改为“容器镜像构建”。依据 [Kaniko 原仓库](https://github.com/GoogleContainerTools/kaniko)。 |
| 可观测性 | 将抓取成功等同于业务依赖健康，直接平均分位数 | 区分 exporter 可达性、上游采集成功和数据新鲜度；说明直方图聚合和 SLO 统计窗口。依据 [Writing exporters](https://prometheus.io/docs/instrumenting/writing_exporters/)、[Histograms](https://prometheus.io/docs/practices/histograms/)。 |
| Terraform | 将状态锁描述为所有后端默认具备 | 限定锁支持与后端配置，说明状态敏感信息及 S3 锁文件设置，标注 DynamoDB 锁方式已弃用。依据 [State locking](https://developer.hashicorp.com/terraform/language/state/locking)、[S3 backend](https://developer.hashicorp.com/terraform/language/backend/s3)。 |
| 项目经验与场景回答 | 将参考设计和未核实指标陈述为个人已完成成果 | STAR 明示经验草稿与待核实角色；结果要求补充本人负责范围、测量口径和实际证据。场景回答保留设计推理，删除未经核实的收益与可用性数字。 |

图示同步修改执行顺序、条件分支与角色关系，包括调度接管、优雅退出、消息确认、Kubernetes 控制流程、TLS 1.3、Prometheus 抓取方向、幂等占位和补偿顺序，避免正文与图示互相矛盾。

## 来源与版本维护

`src/data/sources.ts` 集中维护 165 个官方来源，每张卡片通过类型约束关联引用。页面展示“核心回答”“适用范围”和“官方文档与参考”；长回答按段落显示。引用支持技术定义与机制，不证明个人项目经历。

涉及变化的结论标明实现、版本或配置，例如 Go 1.25、Go 1.23 timer、CPython 3.13 自由线程构建、Python 3.14 进程启动方式和 Django 5.2。部分官方链接会随最新版更新，后续修改内容时应重新核对，不能把最新实现反推为历史行为。

本次对 165 个最终来源地址执行 HTTP GET 检查，均返回 200。修正 go-zero 与 Nacos 的失效路径；MySQL 官网对自动请求返回 403，改用逐项验证过的 Oracle 官方 MySQL 8.4 手册地址。链接可访问与技术内容审阅分别核验，HTTP 状态不作为内容正确性的证明。

## 验证记录

- 自动测试：26 项通过；覆盖既有阅读状态和 Mermaid 失败清理，以及卡片完整性、引用可解析性、交互图节点与连线、STAR 证据状态。
- 兼容性：100 条原有课程深链均保留，分组与卡片 ID 不变，书签和阅读记录继续有效。
- 静态检查与构建：`npm run lint`、`npm run build` 通过；仍有既有 Mermaid/ELK 图形引擎分块体积提示。
- 浏览器图示验证：真实 Mermaid + React StrictMode 下，69 张课程图示生成 69 个 SVG，无错误提示、加载残留或正文外临时容器；错误、正常、卸载场景也通过。
- 页面验证：桌面与 390 px 手机视口下检查核心回答、展开追问、引用和继续学习入口，没有横向溢出；引用链接最小高度 44 px，保留大尺寸翻页按钮及后续内容提示。
- 内容复核：检查定义、条件、版本差异和图文一致性；自动测试负责结构与行为，不代替语义评审。

## Python free-threading 专题补充

补充日期：2026-11-08（America/Los_Angeles）。上文数量与验证记录对应首次内容重构，本节记录后续新增内容。

在 Python 的 GIL 与 asyncio 之间增加独立卡片 `free-threading`，深链为 `#/lang/python/free-threading`。包含核心回答、5 条原理、3 个易错点、5 个追问及迁移验证流程图。GIL 卡片同步更新版本范围，原有课程 ID 和默认入口保持有效。

内容以 CPython 3.14 为明确基线，区分以下问题：

- 版本与构建：3.13 引入实验性自由线程构建，3.14 正式支持，但仍为可选构建，默认构建继续启用 GIL。
- 能力与状态：通过 `sysconfig.get_config_var("Py_GIL_DISABLED")` 检查构建支持，通过 `sys._is_gil_enabled()` 检查实际运行状态；普通构建不能仅靠运行参数获得自由线程能力。
- 扩展兼容性：未声明支持的 C 扩展可能在导入时重新启用 GIL；强制关闭不能解决扩展内部的并发问题。
- 线程安全：容器内部锁不能保护跨多个操作的业务不变量，应明确同步协议或数据所有权。
- 选型与迁移：区分自由线程、多进程和 asyncio；先验证依赖与并发正确性，再比较 GIL 基线、自由线程的单线程与多线程性能，保留回退路径。

参考 [Free-threading HOWTO](https://docs.python.org/3.14/howto/free-threading-python.html)、[3.14 正式支持说明](https://docs.python.org/3.14/whatsnew/3.14.html#free-threaded-python-is-officially-supported)、[C 扩展适配指南](https://docs.python.org/3.14/howto/free-threading-extensions.html) 和 [解释器运行参数](https://docs.python.org/3.14/using/cmdline.html#cmdoption-X)，四个页面均返回 HTTP 200，带锚点的链接已核验目标存在。引用固定到 3.14，避免后续文档更新使版本条件含混。迁移步骤是评估方法，本次未执行 Python 性能基准测试，也未声明实际加速收益。

补充后的课程共 101 张卡片、505 条追问，语言层 26 张，其中 Python 12 张；官方来源共 168 个，图示为 70 张 Mermaid 与 14 张交互图。

验证结果：

- 26 项自动测试通过，课程总数断言同步更新；原有 100 条课程深链继续通过兼容性检查。
- `npm run lint`、`npm run build`、`git diff --check` 通过；保留既有图形引擎分块体积提示。
- 全量浏览器回归生成 70 个 Mermaid SVG，无错误提示、加载残留或正文外临时容器。
- 确认 GIL → Free-threading → asyncio 的前后翻页、追问展开、4 个参考链接与 Python 12 节计数；1280 px 桌面及 390 px 手机视口均无横向溢出，参考链接点击区域高度至少 44 px。
