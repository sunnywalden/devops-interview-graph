# 33 张新增双语卡片逐题复审

复审范围为 `ac62bb3` 相对 `46c7765` 新增的 33 张卡片。逐一阅读两种语言的题干、回答、核心回答、原理和易错点；检查两版是否给出同样的机制、触发条件、版本限制和验证方法。下表每行对应一个卡片 ID，五列按页面题序记录了 165 组问答的核对结论。每张卡片的「参考资料」提供对应的官方文档入口。

## MySQL 8.4：存储引擎、恢复与执行计划

| 卡片 | 第 1 题 | 第 2 题 | 第 3 题 | 第 4 题 | 第 5 题 |
| --- | --- | --- | --- | --- | --- |
| `innodb` | 主键 → 首个全部列均非空的唯一索引 → 隐藏行 ID；区分 GIPK | 一致性读遇到标记删除或较新的二级索引页，覆盖查询仍可能回表 | 短键减少二级索引占用；区分随机插入的页分裂与顺序插入的热点 | 对比事务、并发锁与崩溃恢复 | 分开观察缓冲池、磁盘 I/O、扫描量与锁等待 |
| `innodb-recovery` | redo 重放页修改，undo 回滚未提交事务 | 区分 redo、undo、binlog；从一致备份的位点开始做时间点恢复 | 分别解释 redo 参数的 0、1、2 和 binlog 刷盘；说明设备必须兑现刷盘 | doublewrite 可修复撕裂页，detect-only 只能检测 | binlog 启用时，用有效的 binlog XID 判定内部已预备事务是否提交 |
| `mysql-query-plan` | 联合索引按左前缀定位；交代 Skip Scan 和排序前提 | 区分范围定位、后续列过滤、覆盖和顺序 | `EXPLAIN ANALYZE` 会执行查询；按循环解读行数和时间，不累加包含子节点的时间 | filesort 是额外排序步骤，可以在内存完成 | 对比代表性参数、实际扫描和延迟，同时测写放大 |

同时回查两张已有 MySQL 卡片（不计入上表）：`isolation` 补清 RR 下完整唯一键命中与缺失的区别，以及 RC 下外键和重复键检查的间隙锁例外；`deadlock` 补充通过 `data_lock_waits` 找请求锁和阻塞锁，关联 `data_locks` 与 `INNODB_TRX`，以及最近一次与完整死锁日志的取证区别。

核对入口：[聚簇与二级索引](https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html)、[多版本机制](https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html)、[InnoDB 恢复](https://dev.mysql.com/doc/refman/8.4/en/innodb-recovery.html)、[Binary Log](https://dev.mysql.com/doc/refman/8.4/en/binary-log.html)、[锁定范围](https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html)、[锁等待视图](https://dev.mysql.com/doc/refman/8.4/en/performance-schema-data-lock-waits-table.html)、[EXPLAIN](https://dev.mysql.com/doc/refman/8.4/en/explain.html)。

## Go 后端

| 卡片 | 第 1 题 | 第 2 题 | 第 3 题 | 第 4 题 | 第 5 题 |
| --- | --- | --- | --- | --- | --- |
| `go-collections` | 切片描述信息按值传递，底层数组可能共享 | 用完整切片表达式限容量；需要隔离写入时复制 | nil slice 可 append；nil map 可读，写入会 panic | comma-ok 区分缺键与零值 | 明确同步关系；竞态检测覆盖实际执行路径 |
| `go-control-flow` | 区分 defer 注册时求值与闭包执行时读取 | 后进先出；延迟函数可修改命名返回值 | 同一 goroutine 中由被延迟的函数直接调用 recover | os.Exit 跳过 defer；其他 goroutine 不会因主函数退出而执行清理 | 处理影响写入完整性的关闭错误并保留原错误 |
| `go-worker-pool` | WaitGroup 只等待，errgroup 可传播错误和取消 | `Go` 满额时阻塞且不随 context 解除；`TryGo` 不阻塞 | 首个非 nil 错误或 Wait 返回时取消派生 context | 由确认生产完成的一方关闭任务队列 | 区分已完成与可重试任务，保留幂等边界 |
| `go-http-services` | 区分读请求头超时与读整个请求的超时 | 请求 context 会取消，业务调用需显式传递并配合退出 | 调用方关闭响应体；HTTP/1.x 复用与读至 EOF 有关，应限制读入量 | Gin 鉴权失败后 Abort 并返回 | ResponseRecorder 测 handler；测试服务覆盖真实客户端行为 |
| `go-sql` | sql.DB 是并发安全的池；最大打开连接数 0 表示不限 | 用 InUse、Idle、等待计数和等待时间增量定位池竞争 | 事务操作用 Tx；混用 DB 可能等待额外连接 | 占位符绑定值，动态标识符用允许列表 | 提交结果可能不确定，先按业务键核实 |
| `go-grpc` | gRPC 默认不设置 deadline | 超时不证明写入未发生 | 保留删除字段的编号和名称；区分二进制与 JSON/TextFormat 兼容性 | 暂时失败受预算与幂等限制；参数错误先修请求 | 用序号、检查点与去重支持续传 |
| `go-modules` | MVS 选同一模块路径上要求的最高最低版本 | go.mod 声明要求；go.sum 校验内容，不是锁文件 | v2 及更高版本通常修改模块和导入路径 | GOPRIVATE 配合认证；区分代理与公共校验库 | 对齐工具链、平台、workspace、replace 和依赖获取方式 |

核对入口：[Go 语言规范](https://go.dev/ref/spec)、[errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup)、[net/http](https://pkg.go.dev/net/http)、[database/sql](https://pkg.go.dev/database/sql)、[gRPC deadlines](https://grpc.io/docs/guides/deadlines/)、[Protobuf 兼容性](https://protobuf.dev/programming-guides/proto3/)、[Go Modules](https://go.dev/ref/mod)。

## Python 后端

| 卡片 | 第 1 题 | 第 2 题 | 第 3 题 | 第 4 题 | 第 5 题 |
| --- | --- | --- | --- | --- | --- |
| `py-object-model` | `is` 判断身份，`==` 比较值 | 默认参数在定义时求值 | 浅拷贝共享内部对象，自定义类型可控制拷贝 | 相等对象需要相同哈希；区分可变性和哈希约定 | 闭包晚绑定；用默认值或工厂固定 |
| `py-resource-lifecycle` | `__exit__` 收到异常信息，返回真值会抑制异常 | 区分 CPython 引用计数与循环垃圾收集 | `raise ... from ...` 保留异常链 | 分块读写和回收资源，避免全量加载 | 结合 tracemalloc 与 RSS 区分 Python 分配、原生内存和分配器行为 |
| `py-django-orm` | QuerySet 惰性求值；缓存或后续遍历影响是否用 exists | 单值关系用 select_related；多值关系用 prefetch_related | 在适当的 atomic 边界外捕获 IntegrityError | on_commit 只保证注册时序；可靠发布需要 outbox 等机制 | 兼容旧版本写入，分批回填、验证后再加非空约束 |
| `py-fastapi` | 普通 def 路由在线程池中运行 | 同步辅助函数直接调用不会自动卸载 | 在 lifespan 初始化和清理应用资源；注意每 worker 的范围 | 校验结构后仍需授权与业务约束 | 区分事件循环、线程池和数据库连接池瓶颈 |
| `py-celery` | acks_late 不保证工作进程退出后重投 | retry 发布新消息、沿用 task ID；重投取决于 broker | 事务提交后发送；delay_on_commit 自 5.4 提供 | 用业务键和持久化约束处理重复副作用 | 看积压、等待、耗时、失败与重试率 |
| `py-sqlalchemy` | flush 发出 SQL，提交前其他事务通常不可见 | identity map 按主键维持对象身份，不是查询缓存 | 比较 selectinload 和 joinedload；集合联接使用 Result.unique() | 每个并发任务单独用 AsyncSession | 审查 Alembic 迁移，按兼容阶段发布 |
| `py-testing` | scope 随隔离要求和初始化成本选；注意共享状态 | patch 替换使用处查找的名字 | AsyncMock 检查实际 await | 验证事务回滚、约束与真实隔离行为 | 用可控故障、信号和有界等待替代任意 sleep |

核对入口：[Python 数据模型](https://docs.python.org/3/reference/datamodel.html)、[异常链](https://docs.python.org/3/reference/simple_stmts.html#the-raise-statement)、[Django QuerySet](https://docs.djangoproject.com/en/5.2/ref/models/querysets/)、[Django 事务](https://docs.djangoproject.com/en/5.2/topics/db/transactions/)、[FastAPI 并发](https://fastapi.tiangolo.com/async/)、[Celery 任务](https://docs.celeryq.dev/en/stable/userguide/tasks.html)、[SQLAlchemy Session](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)、[pytest fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html)。

## 基础设施、数据服务与 API

| 卡片 | 第 1 题 | 第 2 题 | 第 3 题 | 第 4 题 | 第 5 题 |
| --- | --- | --- | --- | --- | --- |
| `linux-performance` | load 包含可运行和不可中断睡眠任务 | cgroup 上限、memory.events 层级和 OOM 证据 | MemAvailable 估计与进程 RSS 回答不同问题 | 分开检查块、inode、配额及删除但仍打开的文件 | 结合 I/O 延迟、PSI 与业务尾延迟 |
| `linux-services` | SIGTERM 可处理；SIGKILL 不可捕获 | 僵尸等待父进程回收，孤儿会被重新收养 | 区分进程 FD 限额与系统资源，追踪泄漏 | 检查路径权限、实际身份、强制访问控制和服务沙箱 | 修根因，修改 unit 后重载，reset-failed 清除限频计数 |
| `tcp-transport` | 双向确认初始序号与连接状态 | TCP 提供字节流，应用负责分帧 | TIME_WAIT 与 CLOSE_WAIT 的出现方和诊断不同 | 区分 RST 与无响应，结合抓包 | 从两端抓包，分辨丢包、重传及应用等待 |
| `http-proxy` | HTTP/2 多路复用；底层 TCP 仍有传输层队头阻塞 | QUIC 丢包主要阻塞相关流；拥塞仍可影响共享路径 | 502 上游响应异常，504 上游未及时响应 | 只使用可信代理写入或校验的转发地址 | proxy_read_timeout 是连续两次读取间隔 |
| `pg-mvcc` | Read Committed 每条语句获得新快照 | RR 与 Serializable 的保证不同；40001 重试整个事务 | 普通 VACUUM 回收空间供复用，文件通常不缩小 | 结合统计、长事务及旧快照判断清理滞后 | WAL 负责持久性和恢复，MVCC 管理版本可见性 |
| `pg-query-plan` | 顺序扫描可能成本更低，检查统计和选择率 | ANALYZE 实际执行 UPDATE；回滚不撤销所有外部副作用 | visibility map 决定 index-only scan 是否查堆 | 按 JSONB 操作符选 GIN operator class | 用稳定排序键和唯一补充键做游标分页 |
| `redis-atomicity` | pipeline 降低往返，不保证批量原子 | EXEC 时执行；区分排队错误和执行错误 | WATCH 依赖同一连接；变更、过期或淘汰可使 EXEC 取消 | 脚本执行期间不交错；已执行写入不回滚 | Redis Cluster 多键操作须同槽，可用 hash tag |
| `kafka-consumers` | 位点指向下一条要消费的记录 | 区分撤销和已丢失分区，后者不可提交 | 用稳定键路由到同分区并保持消费处理顺序 | 事务可原子提交 Kafka 输出与位点；外部副作用另管 | 区分 Kafka 位点、RabbitMQ 消费确认和发布者确认 |
| `k8s-autoscaling` | CPU utilization 相对容器 CPU requests | 核对 Pod 调度、就绪、负载转发及下游瓶颈 | 缩容稳定窗口与策略限制 | HPA 扩副本；节点伸缩器处理可由新增节点解决的调度不足 | 队列指标对应积压时长、消费能力及业务目标 |
| `k8s-controllers` | 以当前状态调谐；watch 过期后重列，常用 informer | 409 后重读、重算并按策略重试 | 删除时间戳后等待清理和移除 finalizer | ownerReferences 适用于 Kubernetes 垃圾回收，外部资源另清理 | 复用稳定外部资源标识，实现幂等调谐 |
| `git-workflow` | merge 保留历史关系；rebase 重放提交 | 共享分支用 revert；区分 reset 的用途 | revert -m 指定保留的主线父提交 | 用可重复测试和 skip 处理 bisect 中的异常提交 | 核对制品摘要、配置和数据库兼容性 |
| `ansible` | 优先声明式模块，脚本检查变更条件 | handler 由 changed 通知，通常延后并去重执行 | serial 控制批次，forks 控制并行度；失败阈值按批 | check/diff 有支持范围，保护差异里的秘密 | 重跑检查幂等，并用服务实际状态验证 |
| `cloud-network` | 安全组有状态；网络 ACL 无状态且须考虑回程 | 私有子网出网需路由到公共 NAT 网关及 IGW | 公网负载均衡可把请求转发给私有目标 | IAM 控制 API 权限，路由和过滤控制连通性 | 按可用区比对子网路由、NAT、ACL 与流日志 |
| `api-http` | DELETE 幂等看预期效果，不要求状态码相同 | 对同一作用域的幂等键原子占位并检查请求指纹 | 409 是资源状态冲突，422 是内容无法处理，429 是限频 | 用强 ETag 与 If-Match 防丢更新；失败返回 412 | 稳定顺序、唯一补充键和不可随意修改的游标 |
| `api-security` | 不可猜的 ID 仍须做对象级授权 | access token 给资源服务；ID token 给 OIDC 客户端 | 校验签发者、受众、算法和有效期；轮换留重叠窗口 | CORS 控制浏览器跨源读取，CSRF 保护依赖自动附带凭据的状态变更 | 异步任务显式携带可信租户上下文，执行时校验边界 |
| `api-resilience` | 下游超时受剩余端到端预算约束 | 写入超时后结果不确定；用幂等键或查状态 | 每层含首次最多三次；三层最多 27 次末端尝试 | 区分限流、熔断和资源隔离 | 用故障注入核查降级、恢复与实际尾延迟 |

核对入口：[Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)、[systemd 单元](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html)、[TCP](https://www.rfc-editor.org/rfc/rfc9293)、[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)、[Nginx 反向代理](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)、[PostgreSQL 隔离级别](https://www.postgresql.org/docs/current/transaction-iso.html)、[Redis 事务](https://redis.io/docs/latest/develop/using-commands/transactions/)、[Kafka 再均衡](https://kafka.apache.org/42/javadoc/org/apache/kafka/clients/consumer/ConsumerRebalanceListener.html)、[Kubernetes HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)、[Kubernetes API](https://kubernetes.io/docs/reference/using-api/api-concepts/)、[Git revert](https://git-scm.com/docs/git-revert)、[Ansible 错误处理](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_error_handling.html)、[AWS VPC NAT](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)、[HTTP 语义](https://www.rfc-editor.org/rfc/rfc9110)、[OAuth 安全](https://www.rfc-editor.org/rfc/rfc9700)。

## 三个岗位的二次覆盖检查

以[完整分组盘点](curriculum-coverage.md)中的现有卡片为基线，按岗位核对经常需要解释或排障的机制。三处缺口已补为独立卡片，各含 5 组双语追问与回答，不计入上面的 165 组。

| 岗位 | 复查范围 | 补充及验收要点 |
| --- | --- | --- |
| Go 后端 | 运行时与内存、语言语义、并发、HTTP/gRPC、连接池与存储、依赖管理、测试与退出 | `go-sync-primitives`：Once 的 panic 行为、WaitGroup 计数和等待顺序、Go 1.25 新增 WaitGroup.Go、原子操作与 Mutex 的适用范围、Pool 仅作可丢弃的临时对象缓存。[sync](https://pkg.go.dev/sync) |
| Python 后端 | 对象与数据模型、GIL 与自由线程、并发、Web 框架与 ORM、迁移、任务队列、测试 | `py-attribute-model`：数据描述器优先级、只读 property、三种方法绑定、MRO 与 super、属性查找钩子。[描述器指南](https://docs.python.org/zh-cn/3.14/howto/descriptor.html) |
| DevOps 开发 | Linux、网络与 Shell、容器和编排、CI/CD、云与 IaC、可观测性、交付安全及故障恢复 | `ci-workload-identity`：OIDC 换取 STS 会话、限制项目与引用、角色信任和会话权限、按失败阶段排查、CloudTrail 审计；区分 GitLab.com 与其他部署方式的可用声明。[GitLab OIDC on AWS](https://docs.gitlab.com/ci/cloud_services/aws/) · [AWS STS](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html) |

## 新增三张双语卡片逐题复审

逐项复核 `909baaf` 补充的 3 张卡片及 15 组追问与回答。中英文保留相同题序；核心回答、原理和易错提示也按同一套版本条件和技术边界修订。题号对应卡片内的显示顺序。

| 卡片 | 题号与主题 | 核对结论 | 官方依据 |
| --- | --- | --- | --- |
| `go-sync-primitives` | 1. Once 与 panic | 同一个 Once 不会重试；Go 1.21 新增的 OnceFunc 也不重跑，但后续调用会以同一个值 panic。 | [Once.Do](https://pkg.go.dev/sync#Once.Do) · [OnceFunc](https://pkg.go.dev/sync#OnceFunc) |
| `go-sync-primitives` | 2. WaitGroup 计数 | 计数为零时先登记再 Wait；计数为正时可继续登记。负计数会 panic；上一轮所有 Wait 返回后才可复用。 | [WaitGroup.Add](https://pkg.go.dev/sync#WaitGroup.Add) |
| `go-sync-primitives` | 3. WaitGroup.Go 与 errgroup | WaitGroup.Go 自 Go 1.25 提供，任务函数不得 panic；errgroup 等待所有任务并返回首个非 nil 错误，WithContext 还会在 Wait 返回时取消派生 context。 | [Go 1.25 发布说明](https://go.dev/doc/go1.25#sync) · [errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup#WithContext) |
| `go-sync-primitives` | 4. 原子操作与锁 | Load 与 Store 分开执行会丢失并发更新；Go 1.19 起可用 atomic.Pointer 发布不可变快照，多个读改写者仍需锁或 CAS。 | [atomic.Pointer](https://pkg.go.dev/sync/atomic#Pointer) · [Go 内存模型](https://go.dev/ref/mem#Atomic_Values) |
| `go-sync-primitives` | 5. Pool 的用途 | 池条目可随时丢弃；归还后不能再使用对象及其别名。Reset 保留缓冲区存储，不能作为敏感数据擦除手段。 | [sync.Pool](https://pkg.go.dev/sync#Pool) · [bytes.Buffer.Reset](https://pkg.go.dev/bytes#Buffer.Reset) |
| `py-attribute-model` | 1. 实例属性与描述器 | 先按 MRO 找第一个同名类属性；其中可读的数据描述器优先于实例字典，普通函数可被实例属性遮蔽。 | [实例属性查找](https://docs.python.org/3.14/howto/descriptor.html#invocation-from-an-instance) |
| `py-attribute-model` | 2. 只读 property | 没有 setter 仍走 property 的 `__set__` 并抛出 AttributeError；默认赋值不会回退到实例字典。 | [描述器指南：Properties](https://docs.python.org/3.14/howto/descriptor.html#properties) |
| `py-attribute-model` | 3. 方法绑定 | 区分绑定实例、绑定实际类、无隐式首参；classmethod 包装其他描述器的支持在 Python 3.9 引入、3.11 弃用、3.13 移除。 | [方法类型](https://docs.python.org/3.14/howto/descriptor.html#kinds-of-methods) · [classmethod](https://docs.python.org/3.14/library/functions.html#classmethod) |
| `py-attribute-model` | 4. 菱形继承 | 无参 super 用定义类和首参，沿接收者的 MRO 从定义类之后继续查找；示例中 B 的下一站是 C。 | [super](https://docs.python.org/3.14/library/functions.html#super) · [C3 MRO](https://docs.python.org/3.14/howto/mro.html) |
| `py-attribute-model` | 5. 属性查找钩子 | 点号和 getattr 在 AttributeError 后调用 `__getattr__`；直接调用 `object.__getattribute__` 不会自动回退。隐式特殊方法查找另有规则。 | [描述器调用机制](https://docs.python.org/3.14/howto/descriptor.html#invocation-from-an-instance) · [特殊方法查找](https://docs.python.org/3.14/reference/datamodel.html#special-method-lookup) |
| `ci-workload-identity` | 1. 短期凭证的签发与期限 | GitLab 15.7 引入 id_tokens，17.0 移除旧变量；区分 ID token 与 STS 返回的三项凭证及各自有效期。 | [GitLab 版本记录](https://gitlab.com/gitlab-org/gitlab/-/blob/v16.11.0-ee/doc/ci/secrets/id_token_authentication.md) · [GitLab AWS 集成](https://docs.gitlab.com/ci/cloud_services/aws/) · [AWS STS API](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html) |
| `ci-workload-identity` | 2. 项目、引用与 fork | 匹配签发方、受众和实际 sub；区分 GitLab.com 附加键、AWS 会话及 Self-Managed/Dedicated 支持范围；父项目执行 fork 的流水线仍可使用 fork 的 CI 配置。 | [GitLab AWS 集成](https://docs.gitlab.com/ci/cloud_services/aws/) · [AWS OIDC 条件键](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_iam-condition-keys.html#condition-keys-wif) · [GitLab fork 流水线](https://docs.gitlab.com/ci/pipelines/merge_request_pipelines/#run-pipelines-in-the-parent-project) |
| `ci-workload-identity` | 3. 信任与有效权限 | 信任策略控制角色承担；会话策略只能缩小角色身份策略的授权；资源策略、权限边界和组织策略按适用范围参与评估。 | [AWS STS 会话策略](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html) · [IAM 策略评估](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) |
| `ci-workload-identity` | 4. 按失败阶段排查 | 区分令牌过期、验证、端点连通和信任条件；成功换证后先识别会话，再核查资源权限。 | [AWS STS 错误](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRoleWithWebIdentity.html#API_AssumeRoleWithWebIdentity_Errors) · [GetCallerIdentity](https://docs.aws.amazon.com/STS/latest/APIReference/API_GetCallerIdentity.html) |
| `ci-workload-identity` | 5. 审计与保密 | 用会话标识和时间关联已记录事件；S3 对象操作等数据事件需启用采集。流水线日志和制品不保留原始凭证。 | [IAM 与 CloudTrail](https://docs.aws.amazon.com/IAM/latest/UserGuide/cloudtrail-integration.html) · [CloudTrail 数据事件](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html) |

## 2026-11-09 岗位覆盖与版本复查

逐组盘点现有的 23 个分组和 152 张卡片。Go 后端补请求体解析契约和性能诊断；Python 后端补并发子任务的生命周期和服务端异步 HTTP 调用；DevOps 开发补 Kubernetes 入口路由、节点维护和工作负载安全。已有的 InnoDB、CI 短期凭证、故障恢复及 API 可靠性专题继续保留。下表记录新增 35 组双语追问的核对范围。

| 新增卡片 | 逐题核对 | 主要依据 |
| --- | --- | --- |
| `go-json-contracts` | 缺失、null 与零值；大小和尾随值；数字精度；v1/v2 默认值；迁移契约测试 | [encoding/json](https://pkg.go.dev/encoding/json) · [encoding/json/v2](https://pkg.go.dev/encoding/json/v2) · [Go 1.27](https://go.dev/doc/go1.27) |
| `go-performance-profiling` | B.Loop；基准波动；存活堆与累计分配；低 CPU 高延迟；生产采集 | [B.Loop](https://go.dev/blog/testing-b-loop) · [Go 诊断指南](https://go.dev/doc/diagnostics) · [benchstat](https://pkg.go.dev/golang.org/x/perf/cmd/benchstat) |
| `py-structured-concurrency` | TaskGroup 与 gather；异常组；取消传播；超时捕获；限制并发 | [asyncio Tasks](https://docs.python.org/3.15/library/asyncio-task.html) · [PEP 654](https://peps.python.org/pep-0654/) |
| `py-http-client` | 客户端生命周期；分阶段超时和总预算；连接池等待；流式响应清理；重试范围 | [HTTPX 异步调用](https://www.python-httpx.org/async/) · [超时](https://www.python-httpx.org/advanced/timeouts/) · [传输](https://www.python-httpx.org/advanced/transports/) |
| `k8s-gateway-api` | 资源职责；路由挂载和跨命名空间后端授权；状态排查；权重灰度；迁移控制器 | [Gateway API GA](https://kubernetes.io/blog/2023/10/31/gateway-api-ga/) · [ReferenceGrant](https://gateway-api.sigs.k8s.io/reference/api-types/referencegrant/) · [ingress-nginx 退役](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/) |
| `k8s-disruption-budgets` | 驱逐与删除；预算字段与取整；429 诊断；不健康 Pod 驱逐；选择器迁移 | [配置 PDB](https://kubernetes.io/docs/tasks/run-application/configure-pdb/) · [Eviction API](https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/) · [API 迁移](https://kubernetes.io/docs/reference/using-api/deprecation-guide/#poddisruptionbudget-v125) |
| `k8s-pod-security` | 策略级别；控制器模板与 Pod 准入；Restricted 检查项；已有 Pod；版本试行 | [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) · [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/) |

同步修正 11 张已有卡片的两种语言：

| 知识点 | 核对结果与版本边界 |
| --- | --- |
| Go GMP、计时器、GC | Go 1.27 正式提供 `goroutineleak` profile，可能漏报；同版删除 `asynctimerchan` 开关。Green Tea GC 在 Go 1.25 试验、1.26 默认启用。 [Go 1.26](https://go.dev/doc/go1.26) · [Go 1.27](https://go.dev/doc/go1.27) · [计时器语义](https://go.dev/wiki/Go123Timer) |
| Python GIL、自由线程、ASGI、标准库、多进程 | 区分 3.13 试验、3.14 支持和 3.15 自由线程扩展 ABI、macOS 安装包及 UTF-8 模式。Django 5.2/6.0 的事务仍需同步边界。多进程启动方式需区分平台、3.14 的默认值变化及 3.14.9/3.15.1 的临时目录回退。 [CPython 3.15](https://docs.python.org/3.15/whatsnew/3.15.html) · [PEP 803](https://peps.python.org/pep-0803/) · [Django async](https://docs.djangoproject.com/en/6.0/topics/async/) · [3.14 多进程](https://docs.python.org/3.14/library/multiprocessing.html#contexts-and-start-methods) · [3.15 多进程](https://docs.python.org/3.15/library/multiprocessing.html#contexts-and-start-methods) |
| Kubernetes 容器隔离、Service/Ingress | cgroup v2 在 1.25 稳定；1.35 起 kubelet 默认拒绝 cgroup v1。社区 ingress-nginx 退役与 Ingress API 的状态分别说明。 [cgroup 迁移](https://kubernetes.io/blog/2026/10/06/kubernetes-cgroups-v2-shift/) · [Ingress API](https://kubernetes.io/docs/concepts/services-networking/ingress/) · [ingress-nginx 退役](https://kubernetes.io/blog/2025/11/11/ingress-nginx-retirement/) |
| Prometheus PromQL | 经典与原生直方图的分位数查询不同；原生直方图在 3.8 稳定，3.9 起以抓取配置选择。 [原生直方图规范](https://prometheus.io/docs/specs/native_histograms/) |
| Terraform S3 状态 | 1.10 起可选 S3 锁文件；迁移期间双配置写入端同时取两把锁，等所有写入端使用新锁再移除 DynamoDB 锁。 [Terraform 1.10](https://github.com/hashicorp/terraform/blob/v1.10.0/CHANGELOG.md) · [S3 后端](https://developer.hashicorp.com/terraform/language/backend/s3) |

核对两版是否覆盖相同的前提、异常和验证方法。浏览器逐张打开 7 张新卡并展开全部追问，切换中英文后验证路由、卡片和展开状态保持不变。
