# 岗位考点覆盖盘点

本次从 DevOps 开发、Go 后端和 Python 后端三类岗位的典型工程任务出发，逐组检查机制解释、版本与适用条件、工程取舍和排障验证。优先补足会影响面试回答和实际判断的缺口，例如 InnoDB 的事务持久性、goroutine 的并发边界、Django ORM 的加载策略和 Kubernetes 的控制循环。总览为每个岗位提供 5 个起步知识点，完整目录可按分组浏览。

课程从 20 组 116 张扩展至 23 组 149 张。本轮[逐题复审](curriculum-review.md)核对了新增的 33 张卡片及其 165 组中英文追问与回答，并再补 3 张双语卡片。当前共 23 组、152 张卡片、760 组追问与回答。旧卡片和分组 ID 保留，按 MySQL 分组入口会先打开 InnoDB。

## 语言基础

| 分组 | 卡片数 | 核心覆盖 | 本次补充 |
| --- | --- | --- | --- |
| Go | 14 → 22 | GMP、channel/select、context、内存模型、竞态、逃逸、GC、接口与 nil、错误链、泛型、测试和服务退出 | 数组、切片与 map，defer/panic/recover，任务池与取消，Once/WaitGroup/原子操作/Pool，HTTP 与中间件，连接池与事务，gRPC/Protobuf，Go Modules |
| Python | 12 → 20 | GIL、自由线程、asyncio、线程与进程、装饰器、生成器、类型提示、Pydantic、打包、WSGI/ASGI、标准库和租户隔离 | 对象模型和可变性，属性查找/描述器/MRO，资源与异常，Django ORM，FastAPI，Celery，SQLAlchemy，pytest |
| Shell | 3 | 引号与参数展开、参数边界、退出状态、pipefail、信号清理、幂等脚本与原子替换 | — |

Go 回答按语言规范与运行时或库行为区分保证。Python 回答对自由线程使用 CPython 3.14 基线，对 ORM 的查询加载、事务、回滚和迁移明确框架边界。 [Go 语言规范](https://go.dev/ref/spec) · [CPython 自由线程指南](https://docs.python.org/3.14/howto/free-threading-python.html) · [Django 事务](https://docs.djangoproject.com/en/5.2/topics/db/transactions/)

## 中间件与容器

| 分组 | 卡片数 | 核心覆盖 | 本次补充 |
| --- | --- | --- | --- |
| MySQL | 6 → 9 | 索引、事务隔离、MVCC、死锁、复制、分库分表、缓存一致性 | InnoDB 聚簇与二级索引、B+ 树、缓冲池、记录锁与锁等待排查、redo/undo/binlog、doublewrite、崩溃恢复、联合索引、EXPLAIN ANALYZE |
| PostgreSQL | 0 → 2 | 快照与隔离、VACUUM 与长事务、WAL、查询计划与索引 | 新增独立分组 |
| MongoDB | 6 | 索引、查询、文档建模、事务、副本集、写关注、分片与 Change Stream | — |
| Redis | 6 → 7 | 缓存策略、热点与大 key、数据类型、RDB/AOF、Sentinel、Cluster、锁与 fencing | 流水线、MULTI/EXEC、WATCH、Lua 与同槽约束 |
| 消息 MQ | 5 → 6 | 生产与消费确认、积压、分区内顺序、选型、延时与事务消息 | Kafka 消费组、再均衡、位点提交、幂等与事务语义 |
| Docker/K8s | 18 → 20 | 镜像、容器隔离、控制面、工作负载、CNI、Service/Ingress、网络策略、存储、RBAC、探针、滚动、调度、配额、etcd、节点和 Helm | HPA 的指标与故障路径，控制循环、CRD、Operator 和 finalizer |
| 网络 / DNS / TLS | 4 → 6 | DNS 解析与 CoreDNS、TLS、证书生命周期 | TCP 状态与诊断、HTTP 版本、反向代理、连接池与 502/504 排障 |
| Linux | 0 → 2 | CPU/内存/I/O/磁盘排查、cgroup、进程与信号、权限、systemd、日志 | 新增独立分组 |
| ELK | 3 | 采集与解析、映射与分片、生命周期、缓冲、背压和失败重放 | — |
| Prometheus | 3 | 抓取与发现、指标类型和基数、PromQL 聚合与分位数、告警规则及路由 | — |
| GitLab CI/CD | 3 | 作业 DAG、Runner 调度与信任边界、环境保护与部署回滚 | — |
| Jenkins CI | 3 | Jenkinsfile、声明式流水线、Agent 与制品、共享库、凭据与隔离 | — |

MySQL 按 MySQL 8.4 说明存储引擎和优化器行为。PostgreSQL 另设专题，分别说明它的快照、清理机制和 WAL。Kubernetes 题目将调度、伸缩和控制器职责分开。 [MySQL 8.4 InnoDB](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/innodb-storage-engine.html) · [PostgreSQL MVCC](https://www.postgresql.org/docs/current/mvcc.html) · [Kubernetes 控制器](https://kubernetes.io/docs/concepts/architecture/controller/)

## 场景实战

| 分组 | 卡片数 | 核心覆盖 | 本次补充 |
| --- | --- | --- | --- |
| CI/CD | 9 | 作业依赖、模板、缓存与制品、质量门禁、镜像构建、合并请求、部署、灰度、安全扫描与执行器容量 | — |
| 监控 | 4 | 黄金信号、联邦、SLI/SLO、错误预算与告警治理 | — |
| 日志 | 3 | 日志保留、结构化日志、关联 ID 与分布式追踪 | — |
| 运维平台 | 3 → 7 | 平台设计、Terraform 状态、GitOps | Git 合并与回退、Ansible 幂等与滚动、云网络与 IAM、CI 工作负载身份与短期云凭证 |
| 后端 API | 0 → 3 | HTTP 契约、幂等与并发更新、身份验证、授权与租户边界、超时、重试、限流和熔断 | 新增独立分组 |
| CMDB | 4 | 幂等、租约与 fencing、流程补偿、预计算任务 | — |
| 报表/看板 | 1 | 聚合预计算、数据新鲜度、读写成本和效果验证 | — |
| 其他 | 6 | Nacos、审计、备份恢复、密钥管理、故障响应、容量规划 | — |

每张新卡片包含核心回答、5 组追问与回答、原理、易错点、适用条件及官方参考资料。两种语言使用相同的卡片 ID 和引用，按同一机制、失败条件与验证方式组织。 [HTTP 语义](https://www.rfc-editor.org/rfc/rfc9110) · [Ansible Playbook](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_intro.html)
