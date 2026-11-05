import type { CardVisual } from "../types";

export const languageVisuals: Record<string, CardVisual[]> = {
  "go/gmp": [
    {
      kind: "mermaid",
      title: "GMP 与工作窃取",
      source: `flowchart LR
  subgraph P1["P1 本地队列"]
    G1[G]
    G2[G]
  end
  subgraph P2["P2 本地队列"]
    G3[G]
  end
  M1[M 线程] --> P1
  M2[M 线程] --> P2
  Global[全局 runq] -.-> P1
  P2 -->|"偷一半"| P1
  P1 --> Netpoll[网络轮询器]
  Syscall[阻塞 syscall] -.->|另起 M| M3[M']`,
    },
    {
      kind: "flow",
      title: "调度关系（可拖动画布）",
      nodes: [
        { id: "g", label: "G 协程", detail: "用户态任务", x: 40, y: 40 },
        { id: "p", label: "P 处理器", detail: "本地 runq", x: 260, y: 40 },
        { id: "m", label: "M 线程", detail: "OS thread", x: 480, y: 40 },
        { id: "steal", label: "工作窃取", detail: "空闲 P 偷邻 P", x: 260, y: 180 },
        { id: "bound", label: "业务背压", detail: "信号量/有界队列", x: 40, y: 180 },
      ],
      edges: [
        { from: "g", to: "p", label: "入队" },
        { from: "p", to: "m", label: "绑定执行" },
        { from: "steal", to: "p", label: "补充任务" },
        { from: "bound", to: "g", label: "限制创建" },
      ],
    },
  ],
  "go/ctx": [
    {
      kind: "mermaid",
      title: "context 取消树",
      source: `flowchart TB
  Root["WithTimeout 入口"] --> Mid["中间件注入 trace"]
  Mid --> H["Handler"]
  H --> L["Logic / Service"]
  L --> DB["DB 调用"]
  L --> RPC["下游 gRPC"]
  Root -.->|cancel / deadline| Mid
  Mid -.-> H
  H -.-> L
  L -.-> DB
  L -.-> RPC`,
    },
  ],
  "go/chan": [
    {
      kind: "mermaid",
      title: "channel / select 与背压",
      source: `flowchart LR
  Prod[生产者] -->|send| Q["有界 channel"]
  Q -->|recv| W1[Worker1]
  Q --> W2[Worker2]
  Ctx[ctx.Done] --> Sel[select]
  Q --> Sel
  Sel -->|超时/取消| Exit[退出]
  Sel -->|取到任务| Work[处理]`,
    },
  ],
  "go/gomodel": [
    {
      kind: "mermaid",
      title: "happens-before",
      source: `flowchart LR
  Send[通道发送] --> Recv[对应接收完成]
  Unlock[Unlock] --> Lock[之后的 Lock 返回]
  Write[先写完数据] --> Flag[再原子发布标志]
  Flag --> Read[读者看见数据]`,
    },
  ],
  "go/mem": [
    {
      kind: "mermaid",
      title: "逃逸与分配直觉",
      source: `flowchart TB
  Stack[栈上分配] --> Fast[快 / 随函数结束释放]
  Heap[堆上分配] --> GC[需 GC]
  Escape[逃逸分析] -->|返回指针/闭包捕获| Heap
  Escape -->|仅局部使用| Stack`,
    },
  ],
  "go/gozero": [
    {
      kind: "flow",
      title: "go-zero 服务分层",
      nodes: [
        { id: "api", label: "API / Gateway", detail: "REST/GraphQL", x: 60, y: 20 },
        { id: "mw", label: "中间件", detail: "超时·鉴权·限流", x: 60, y: 120 },
        { id: "logic", label: "Logic", detail: "业务编排", x: 60, y: 220 },
        { id: "rpc", label: "RPC Client", detail: "对内 gRPC", x: 300, y: 220 },
        { id: "model", label: "Model", detail: "Mongo/MySQL", x: 300, y: 120 },
      ],
      edges: [
        { from: "api", to: "mw" },
        { from: "mw", to: "logic" },
        { from: "logic", to: "rpc" },
        { from: "logic", to: "model" },
      ],
    },
  ],
  "go/graphql": [
    {
      kind: "mermaid",
      title: "多协议对外对内",
      source: `flowchart LR
  Client[外部客户端] --> GQL[GraphQL]
  Client2[外部 REST] --> REST[REST]
  GQL --> Core[领域服务]
  REST --> Core
  Core --> GRPC[对内 gRPC]
  GQL --> DL[DataLoader]`,
    },
  ],
  "go/iface": [
    {
      kind: "mermaid",
      title: "interface 与 nil",
      source: `flowchart TB
  I["interface{} 两词: type + data"]
  I --> T[动态类型]
  I --> D[动态值]
  N1["typed nil 赋给 interface"] --> Trap["interface ≠ nil"]
  N2["真正的 nil interface"] --> OK["== nil"]`,
    },
  ],
  "go/errwrap": [
    {
      kind: "mermaid",
      title: "error wrapping 链",
      source: `flowchart LR
  Root[根因 err] --> W1["fmt.Errorf %w"]
  W1 --> W2["再包一层业务语义"]
  W2 --> Check{"errors.Is / As"}
  Check -->|匹配| Handle[分支处理]
  Check -->|未知| Log[记日志上抛]`,
    },
  ],
  "go/syncmap": [
    {
      kind: "mermaid",
      title: "何时 Mutex / sync.Map",
      source: `flowchart TB
  Need[共享状态] --> Q{读多写少且 key 独立?}
  Q -->|是| SM[sync.Map]
  Q -->|否 / 复杂临界区| MU[Mutex / RWMutex]
  MU --> Crit[把临界区缩到最短]`,
    },
  ],
  "go/graceful": [
    {
      kind: "mermaid",
      title: "HTTP 优雅退出",
      source: `sequenceDiagram
  participant K as K8s/SIGTERM
  participant S as Server
  participant H as Handlers
  K->>S: SIGTERM
  S->>S: 停监听新连接
  S->>H: Shutdown 等待 inflight
  H-->>S: 完成或超时强杀
  S-->>K: 进程退出`,
    },
  ],
  "go/gc": [
    {
      kind: "mermaid",
      title: "GC 关注点",
      source: `flowchart LR
  Alloc[分配速率] --> GC[并发标记清除]
  GC --> Pause[STW 短暂停]
  Tune[GOGC / GOMEMLIMIT] --> GC
  Pprof[pprof heap] --> Alloc`,
    },
  ],
  "python/gil": [
    {
      kind: "mermaid",
      title: "GIL 与并行边界",
      source: `flowchart TB
  CPU[CPU 密集] --> MP[多进程 / 别的语言]
  IO[IO 密集] --> Async[asyncio / 线程]
  GIL[GIL] -.->|同一时刻一线程执行字节码| CPU
  GIL -.->|IO 等待会释放| IO`,
    },
    {
      kind: "flow",
      title: "选型示意",
      nodes: [
        { id: "gil", label: "GIL", detail: "CPython", x: 200, y: 20 },
        { id: "th", label: "线程", detail: "适合 IO", x: 40, y: 140 },
        { id: "mp", label: "多进程", detail: "适合 CPU", x: 200, y: 140 },
        { id: "as", label: "asyncio", detail: "单线程高并发 IO", x: 360, y: 140 },
      ],
      edges: [
        { from: "gil", to: "th", label: "释放于阻塞" },
        { from: "gil", to: "mp", label: "绕开" },
        { from: "gil", to: "as", label: "协作式" },
      ],
    },
  ],
  "python/asyncio": [
    {
      kind: "mermaid",
      title: "事件循环与协程",
      source: `flowchart LR
  Loop[事件循环] --> T1[Task A await IO]
  Loop --> T2[Task B await IO]
  T1 -->|就绪| Loop
  T2 -->|就绪| Loop
  Block[误用同步阻塞] -.->|卡住整环| Loop`,
    },
  ],
  "python/django": [
    {
      kind: "flow",
      title: "多租户权限过滤",
      nodes: [
        { id: "req", label: "请求", detail: "租户上下文", x: 40, y: 80 },
        { id: "mw", label: "中间件", detail: "解析 tenant", x: 220, y: 80 },
        { id: "orm", label: "ORM 过滤", detail: "强制 tenant_id", x: 400, y: 80 },
        { id: "audit", label: "审计", detail: "协程配额隔离", x: 400, y: 200 },
      ],
      edges: [
        { from: "req", to: "mw" },
        { from: "mw", to: "orm" },
        { from: "mw", to: "audit" },
      ],
    },
  ],
  "python/exp": [
    {
      kind: "mermaid",
      title: "Exporter 拉取链路",
      source: `sequenceDiagram
  participant P as Prometheus
  participant E as Python Exporter
  participant T as 目标系统
  P->>E: HTTP scrape /metrics
  E->>T: 采集
  T-->>E: 原始数据
  E-->>P: 暴露指标`,
    },
  ],
  "python/vsgo": [
    {
      kind: "mermaid",
      title: "Python vs Go 分工",
      source: `flowchart TB
  subgraph Go层
    Svc[服务 / Worker]
    Eng[工程化与并发]
  end
  subgraph Py层
    Plat[权限平台 / 审计]
    Auto[自动化 / Exporter]
  end
  Go层 --- Py层`,
    },
  ],
  "python/mp": [
    {
      kind: "mermaid",
      title: "多进程 vs 线程",
      source: `flowchart LR
  Job[任务类型] --> CPU{CPU?}
  CPU -->|是| Proc[multiprocessing]
  CPU -->|否 IO| Thr[threading / asyncio]`,
    },
  ],
  "python/asgi": [
    {
      kind: "mermaid",
      title: "WSGI / ASGI",
      source: `flowchart TB
  WSGI[WSGI 同步] --> SyncApp[Django 经典]
  ASGI[ASGI 异步] --> AsyncApp[Channels / FastAPI]
  ASGI --> Long[长连接 / SSE]`,
    },
  ],
};
