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
      title: "索引与两阶段查询",
      source: `flowchart TB
  Q[查询] --> Ix[索引扫描]
  Ix --> Fetch[回表取文档]
  Q --> Coll[COLLSCAN 危险]
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
        { id: "cls", label: "Cluster", detail: "分片 16384 slot", x: 420, y: 80 },
      ],
      edges: [
        { from: "sent", to: "master", label: "监控/故障转移" },
        { from: "master", to: "slave", label: "复制" },
        { from: "cls", to: "master", label: "槽位路由" },
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
  Big[大 key] --> Del[渐进删除]
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
  P->>B: 发送 + 确认
  B->>B: 持久化
  B->>C: 投递
  C->>C: 业务幂等
  C-->>B: ack / nack`,
    },
  ],
  "mq/backlog": [
    {
      kind: "mermaid",
      title: "积压治理",
      source: `flowchart LR
  Lag[消费滞后] --> Scale[扩消费者]
  Lag --> Batch[批量/并行]
  Lag --> Drop[降级丢弃非关键]
  Lag --> Replay[独立重放通道]`,
    },
  ],
  "mq/ordering": [
    {
      kind: "mermaid",
      title: "分区键与顺序",
      source: `flowchart TB
  Key[业务键 hash] --> Part[同一分区]
  Part --> Order[分区内有序]
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
  participant RS as ReplicaSet
  participant New as 新 Pod
  participant Old as 旧 Pod
  RS->>New: 创建
  New->>New: startup/readiness
  New-->>RS: Ready
  RS->>Old: 缩容
  Note over New: liveness 只杀复活,别误伤慢启动`,
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
  "net/tls": [
    {
      kind: "mermaid",
      title: "TLS 握手要点",
      source: `sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: ClientHello
  S->>C: Certificate
  C->>S: 密钥交换
  Note over C,S: 之后应用数据加密`,
    },
  ],
};
