import type { CardVisual } from "../types";

export const middlewareVisuals: Record<string, CardVisual[]> = {
  "mysql/basic": [
    {
      kind: "mermaid",
      title: "索引与慢查路径",
      source: `flowchart TB
  SQL[SQL] --> Opt[优化器]
  Opt --> Idx{用上索引?}
  Idx -->|是| Range[范围/回表]
  Idx -->|否| Full[全表扫]
  Slow[慢日志] --> Explain[EXPLAIN]
  Explain --> Opt`,
    },
  ],
  "mysql/with-cache": [
    {
      kind: "mermaid",
      title: "Cache-Aside 读路径",
      source: `sequenceDiagram
  participant App
  participant Redis
  participant MySQL
  App->>Redis: GET
  alt 命中
    Redis-->>App: value
  else 未命中
    App->>MySQL: SELECT
    MySQL-->>App: row
    App->>Redis: SET (+空值/TTL)
  end`,
    },
    {
      kind: "flow",
      title: "防护点",
      nodes: [
        { id: "app", label: "应用", x: 40, y: 80 },
        { id: "local", label: "本地缓存", detail: "热 key", x: 200, y: 20 },
        { id: "redis", label: "Redis", x: 200, y: 140 },
        { id: "db", label: "MySQL", x: 400, y: 80 },
        { id: "sf", label: "单飞", detail: "防击穿", x: 200, y: 260 },
      ],
      edges: [
        { from: "app", to: "local" },
        { from: "app", to: "redis" },
        { from: "redis", to: "db", label: "未命中" },
        { from: "sf", to: "db", label: "合并回源" },
      ],
    },
  ],
  "mysql/isolation": [
    {
      kind: "mermaid",
      title: "隔离级别直觉",
      source: `flowchart LR
  RU[读未提交] --> RC[读已提交]
  RC --> RR[可重复读]
  RR --> SZ[串行化]
  RC --> MVCC[MVCC 版本链]
  RR --> MVCC`,
    },
  ],
  "mysql/deadlock": [
    {
      kind: "mermaid",
      title: "死锁环",
      source: `flowchart LR
  T1[事务A 持有锁1] -->|等待| L2[锁2]
  T2[事务B 持有锁2] -->|等待| L1[锁1]
  L1 --- T1
  L2 --- T2
  Detect[死锁检测] -->|回滚代价小的一方| Victim[牺牲者]`,
    },
  ],
  "mongo/mongo-idx": [
    {
      kind: "mermaid",
      title: "索引与文档访问",
      source: `flowchart TB
  Q[查询计划] --> Ix[IXSCAN 索引扫描]
  Ix --> Fetch[需要文档字段时 FETCH]
  Ix --> Cover[覆盖查询可避免 FETCH]
  Q --> Coll[COLLSCAN 集合扫描]
  Coll --> Check[结合集合大小与选择性评估成本]
  Hint[复合索引最左前缀] --> Ix`,
    },
  ],
  "mongo/replica": [
    {
      kind: "flow",
      title: "副本集写关注",
      nodes: [
        { id: "pri", label: "Primary", detail: "接受写", x: 200, y: 20 },
        { id: "s1", label: "Secondary", x: 40, y: 160 },
        { id: "s2", label: "Secondary", x: 360, y: 160 },
        { id: "w", label: "writeConcern", detail: "majority…", x: 200, y: 280 },
      ],
      edges: [
        { from: "pri", to: "s1", label: "复制" },
        { from: "pri", to: "s2", label: "复制" },
        { from: "w", to: "pri", label: "确认策略" },
      ],
    },
  ],
  "mongo/schema": [
    {
      kind: "mermaid",
      title: "嵌入 vs 引用",
      source: `flowchart TB
  Doc[文档建模] --> Emb{一起读/有界?}
  Emb -->|是| Embed[嵌入]
  Emb -->|否/很大/共享| Ref[引用 + 二次查询]`,
    },
  ],
  "redis/redis": [
    {
      kind: "mermaid",
      title: "二级缓存与三大问题",
      source: `flowchart TB
  Req[请求] --> L1[本地缓存]
  L1 -->|miss| L2[Redis]
  L2 -->|miss| DB[(DB)]
  Pen[穿透] -.->|空值/布隆| L2
  Brk[击穿] -.->|单飞| DB
  Av[雪崩] -.->|抖动 TTL| L2`,
    },
  ],
  "redis/persist": [
    {
      kind: "mermaid",
      title: "AOF / RDB",
      source: `flowchart LR
  Mem[内存数据] --> RDB[RDB 快照]
  Mem --> AOF[AOF 日志]
  RDB --> Disk[(磁盘)]
  AOF --> Disk
  Restart[重启恢复] --> Disk`,
    },
  ],
  "redis/cluster": [
    {
      kind: "flow",
      title: "Cluster vs Sentinel",
      nodes: [
        { id: "sent", label: "Sentinel", detail: "高可用主从", x: 40, y: 80 },
        { id: "master", label: "Master", x: 220, y: 40 },
        { id: "slave", label: "Replica", x: 220, y: 140 },
        { id: "cls", label: "Cluster", detail: "分片 16384 slot", x: 440, y: 40 },
        { id: "shards", label: "分片主节点与副本", detail: "Cluster 自身负责故障转移", x: 440, y: 180 },
      ],
      edges: [
        { from: "sent", to: "master", label: "监控/故障转移" },
        { from: "master", to: "slave", label: "复制" },
        { from: "cls", to: "shards", label: "槽位路由" },
      ],
    },
  ],
  "redis/hotkey": [
    {
      kind: "mermaid",
      title: "热 key / 大 key",
      source: `flowchart TB
  Hot[热 key] --> Local[本地缓存]
  Hot --> Split[拆 key]
  Big[大 key] --> Del[评估 UNLINK 异步回收]
  Big --> Break[拆分结构]`,
    },
  ],
  "mq/mq": [
    {
      kind: "mermaid",
      title: "消息可靠性",
      source: `sequenceDiagram
  participant P as Producer
  participant B as Broker
  participant C as Consumer
  P->>B: 发送消息
  B->>B: 按配置持久化或复制
  B-->>P: 达到确认条件后响应
  B->>C: 投递
  C->>C: 幂等执行业务并提交
  C-->>B: 确认消费 / 提交 offset
  Note over B,C: 确认前故障可能导致重复投递`,
    },
  ],
  "mq/backlog": [
    {
      kind: "mermaid",
      title: "积压治理",
      source: `flowchart LR
  Lag[消费滞后] --> Cause[定位生产速率与消费瓶颈]
  Cause --> Scale[在分区数和下游容量内扩容]
  Cause --> Batch[按顺序约束评估批量或并行]
  Cause --> Isolate[隔离失败消息并建立可追溯重放]
  Cause --> Backpressure[限流或暂缓非关键生产]`,
    },
  ],
  "mq/ordering": [
    {
      kind: "mermaid",
      title: "分区键与顺序",
      source: `flowchart TB
  Key[业务键 hash] --> Part[同一分区]
  Part --> Order[日志分区内有序]
  Order --> Serial[业务完成顺序还需约束并发和重试]
  Cross[跨分区] --> NoOrder[不保证全局序]`,
    },
  ],
  "container/docker": [
    {
      kind: "mermaid",
      title: "镜像分层",
      source: `flowchart TB
  Base[基础镜像] --> Deps[依赖层]
  Deps --> App[应用层]
  App --> Runtime[入口 CMD/ENTRYPOINT]
  Cache[构建缓存] -.-> Deps`,
    },
  ],
  "container/probe": [
    {
      kind: "mermaid",
      title: "探针与滚动发布",
      source: `sequenceDiagram
  participant RS as Deployment / ReplicaSet 控制器
  participant New as 新 Pod
  participant Old as 旧 Pod
  RS->>New: 创建
  New->>New: startup/readiness
  New-->>RS: Ready
  RS->>Old: 按滚动策略和可用性条件缩容
  Note over New: liveness 失败可重启容器；startup 保护启动阶段`,
    },
  ],
  "container/sched": [
    {
      kind: "flow",
      title: "调度与资源",
      nodes: [
        { id: "pod", label: "Pod", detail: "request/limit", x: 40, y: 80 },
        { id: "sch", label: "Scheduler", x: 220, y: 80 },
        { id: "node", label: "Node", detail: "可分配资源", x: 400, y: 80 },
        { id: "evict", label: "驱逐", detail: "压力时", x: 400, y: 200 },
      ],
      edges: [
        { from: "pod", to: "sch" },
        { from: "sch", to: "node", label: "打分绑定" },
        { from: "node", to: "evict" },
      ],
    },
  ],
  "container/cicdlink": [
    {
      kind: "mermaid",
      title: "CI 到集群",
      source: `flowchart LR
  CI[GitLab Job] --> Img[镜像仓库]
  Img --> Deploy[部署 Job / GitOps]
  Deploy --> K8s[Kubernetes]`,
    },
  ],
  "container/config": [
    {
      kind: "mermaid",
      title: "ConfigMap / Secret",
      source: `flowchart TB
  CM[ConfigMap] --> Vol[挂卷]
  CM --> Env[环境变量]
  Sec[Secret] --> Vol
  Sec --> Env
  Note[敏感配置勿进镜像]`,
    },
  ],
  "container/svc": [
    {
      kind: "mermaid",
      title: "Service / Ingress",
      source: `flowchart LR
  Ext[外部流量] --> Ing[Ingress]
  Ing --> Svc[Service]
  Svc --> Pods[Pod Endpoints]`,
    },
  ],
  "container/troubleshoot": [
    {
      kind: "mermaid",
      title: "排障顺序",
      source: `flowchart TB
  Sym[症状] --> Ev[Events]
  Ev --> Desc[describe]
  Desc --> Logs[logs]
  Logs --> Res[资源 / 探针 / 镜像]`,
    },
  ],
  "net/dns": [
    {
      kind: "mermaid",
      title: "解析路径",
      source: `flowchart LR
  App --> Stub[本地 stub]
  Stub --> CoreDNS
  CoreDNS --> Upstream[上游 DNS]`,
    },
  ],
  "container/arch": [
    {
      kind: "mermaid",
      title: "请求进入集群",
      source: `flowchart TB
  Client[kubectl / 控制器] --> API[kube-apiserver]
  API --> ETCD[(etcd)]
  API --> Sched[kube-scheduler]
  API --> CM[controller-manager]
  Sched -->|写回绑定| API
  Kubelet[kubelet] -->|watch / 上报| API
  Kubelet --> CRI[容器运行时]
  Proxy[kube-proxy] -->|watch Service| API`,
    },
    {
      kind: "flow",
      title: "控制面与节点",
      nodes: [
        { id: "api", label: "apiserver", detail: "认证鉴权准入", x: 220, y: 16 },
        { id: "etcd", label: "etcd", detail: "期望状态", x: 460, y: 16 },
        { id: "sched", label: "scheduler", detail: "只绑定节点", x: 40, y: 150 },
        { id: "cm", label: "控制器", detail: "补齐 Pod", x: 250, y: 150 },
        { id: "kubelet", label: "kubelet", detail: "本节点执行", x: 40, y: 290 },
        { id: "cri", label: "运行时", detail: "起容器", x: 250, y: 290 },
        { id: "proxy", label: "kube-proxy", detail: "Service 转发", x: 460, y: 290 },
      ],
      edges: [
        { from: "api", to: "etcd", label: "落库" },
        { from: "sched", to: "api", label: "绑定" },
        { from: "cm", to: "api", label: "watch" },
        { from: "kubelet", to: "api", label: "上报" },
        { from: "kubelet", to: "cri" },
        { from: "proxy", to: "api", label: "watch" },
      ],
    },
  ],
  "container/workload": [
    {
      kind: "mermaid",
      title: "控制器边界",
      source: `flowchart TB
  Dep[Deployment] --> RS[ReplicaSet]
  RS --> Pod[可替换 Pod]
  STS[StatefulSet] --> Stable[稳定身份与按需配置的持久卷]
  DS[DaemonSet] --> PerNode[每个符合条件的节点部署 Pod]
  Job[Job / CronJob] --> Done[运行至完成；任务需处理重试]`,
    },
  ],
  "container/cni": [
    {
      kind: "mermaid",
      title: "Pod IP 与 Service",
      source: `flowchart LR
  CNI[CNI 分配 Pod IP] --> A[Pod]
  CNI --> B[Pod]
  A -->|按 IP 直连| B
  Svc[Service 与 EndpointSlice] --> Proxy[kube-proxy 或替代实现]
  Proxy --> Rules[配置 Service 转发规则]
  Traffic[访问 Service 虚拟 IP] --> Rules
  Rules -->|默认选择就绪端点| A
  Rules --> B`,
    },
  ],
  "container/volume": [
    {
      kind: "mermaid",
      title: "PVC 绑定",
      source: `flowchart LR
  PVC[PVC 申请] --> Match{现有 PV 是否满足条件}
  Match -->|静态匹配| PV[PV]
  Match -->|需要且支持动态供给| SC[StorageClass 指定供给器]
  SC --> Prov[动态创建 PV]
  Prov --> PV
  PV --> Bound[PVC 与 PV 绑定]
  Bound --> Pod[Pod 挂载]`,
    },
  ],
  "mysql/repl": [
    {
      kind: "mermaid",
      title: "主从复制",
      source: `flowchart LR
  App[写] --> Src[主库 binlog]
  Src --> IO[从库 IO 线程]
  IO --> Relay[中继日志]
  Relay --> SQL[SQL 线程]
  SQL --> Read[读从库需接受延迟]`,
    },
  ],
  "net/coredns": [
    {
      kind: "mermaid",
      title: "集群解析",
      source: `flowchart LR
  Pod[Pod] -->|搜索域 / ndots| DNS[CoreDNS]
  DNS --> Svc[Service 虚拟地址]
  DNS --> Head[无头 Service 的 Pod IP]
  DNS --> Up[上游]`,
    },
  ],
  "net/tls": [
    {
      kind: "mermaid",
      title: "TLS 1.3 证书认证握手概要",
      source: `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: ClientHello 与 key_share
  S->>C: ServerHello 与 key_share
  Note over C,S: 派生握手密钥，后续握手消息加密
  S->>C: Certificate / CertificateVerify / Finished
  C->>C: 验证证书链、服务身份与签名
  C->>S: Finished
  Note over C,S: 使用应用流量密钥交换数据；恢复握手可不同`,
    },
  ],
};
