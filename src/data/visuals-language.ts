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
  P2 -->|转移部分可运行 G| P1
  P1 --> Netpoll[网络轮询器]
  Syscall[阻塞系统调用中的 M] -.->|P 可交给其他 M| M3[复用或创建 M]`,
    },
    {
      kind: "flow",
      title: "调度关系",
      nodes: [
        { id: "g", label: "G 协程", detail: "用户态任务", x: 40, y: 40 },
        { id: "p", label: "P 处理器", detail: "本地 runq", x: 260, y: 40 },
        { id: "m", label: "M 线程", detail: "OS thread", x: 480, y: 40 },
        { id: "steal", label: "工作窃取", detail: "转移其他 P 队列中的可运行 G", x: 260, y: 180 },
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
  Unlock[Mutex.Unlock] --> Lock[同一 Mutex 后续 Lock 返回]
  Write[先写完数据] --> Flag[再原子发布标志]
  Flag --> Observe[原子读取观察到该标志写入]
  Observe --> Read[读取已发布且不再修改的数据]`,
    },
  ],
  "go/mem": [
    {
      kind: "mermaid",
      title: "逃逸分析与实际分配",
      source: `flowchart TB
  Source[指针使用与对象生命周期] --> Compiler[编译器逃逸分析与优化]
  Compiler --> Stack[可能在栈上分配]
  Compiler --> Heap[可能在堆上分配]
  Compiler --> Elide[分配可能被优化消除]
  Heap --> GC[纳入垃圾回收]
  Compiler --> Verify[编译诊断与分配基准验证]`,
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
  I["接口值：动态类型与动态值"]
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
  Need[共享状态] --> Q{是否需要维护多个字段的不变量}
  Q -->|是| MU[普通 map 加锁]
  Q -->|否| Pattern{一次写入多次读取或不同键集合并发操作}
  Pattern -->|匹配| SM[评估 sync.Map]
  Pattern -->|不匹配| MU
  SM --> Bench[按实际负载验证]
  MU --> Bench`,
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
  alt 活跃请求完成
    H-->>S: Shutdown 返回 nil
  else Shutdown 的 context 到期
    S->>S: Shutdown 返回超时错误
    Note over S,H: 调用方决定 Close 连接并取消后台任务
  end
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
  Pprof[allocs 累计分配剖析] --> Alloc
  Heap[heap 存活对象剖析] --> Live[定位对象保留来源]`,
    },
  ],
  "python/gil": [
    {
      kind: "mermaid",
      title: "启用 GIL 的 CPython：并行边界",
      source: `flowchart TB
  CPU[纯 Python CPU 密集任务] --> MP[评估多进程或释放 GIL 的扩展]
  IO[IO 密集] --> Async[asyncio / 线程]
  GIL[GIL] -.->|同一解释器中通常仅一线程执行 Python 代码| CPU
  GIL -.->|阻塞 IO 通常释放 GIL| IO
  Free[可选 free-threaded 构建] --> Check[另行检查扩展兼容性和线程安全]`,
    },
    {
      kind: "flow",
      title: "选型示意",
      nodes: [
        { id: "gil", label: "GIL", detail: "启用 GIL 的 CPython", x: 200, y: 20 },
        { id: "th", label: "线程", detail: "适合 IO", x: 40, y: 140 },
        { id: "mp", label: "多进程", detail: "适合 CPU", x: 200, y: 140 },
        { id: "as", label: "asyncio", detail: "单线程高并发 IO", x: 360, y: 140 },
      ],
      edges: [
        { from: "gil", to: "th", label: "阻塞 IO 通常释放" },
        { from: "gil", to: "mp", label: "独立解释器" },
        { from: "gil", to: "as", label: "协作式" },
      ],
    },
  ],
  "python/free-threading": [
    {
      kind: "mermaid",
      title: "Free-threading：从兼容性到收益验证",
      source: `flowchart TB
  Build[选择 free-threaded CPython 构建] --> Import[加载实际依赖及延迟导入模块]
  Import --> GIL{GIL 当前是否关闭}
  GIL -->|否| Inspect[检查启动配置与扩展兼容性]
  Inspect -->|修正后重新检测| Import
  GIL -->|是| Correct[验证共享状态同步与并发结果]
  Correct --> Valid{正确性是否通过}
  Valid -->|否| Fix[修复竞争与生命周期问题后重新验证]
  Fix --> Correct
  Valid -->|是| Bench[比较单线程与多线程的吞吐 延迟和内存]
  Bench --> Benefit{收益与成本是否符合目标}
  Benefit -->|是| Rollout[逐步迁移并保留回退路径]
  Benefit -->|否| Retain[保留原方案或评估其他并发方案]`,
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
  Block[同步阻塞调用] -.->|阻塞事件循环线程| Loop`,
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
        { id: "audit", label: "审计与配额", detail: "租户任务额度与访问记录", x: 400, y: 200 },
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
  subgraph GoLayer["Go 层"]
    Svc[服务 / Worker]
    Eng[工程化与并发]
  end
  subgraph PyLayer["Python 层"]
    Plat[权限平台 / 审计]
    Auto[自动化 / Exporter]
  end
  GoLayer --- PyLayer`,
    },
  ],
  "python/mp": [
    {
      kind: "mermaid",
      title: "多进程 vs 线程",
      source: `flowchart LR
  Job[任务类型与解释器构建] --> CPU{启用 GIL 的纯 Python CPU 任务}
  CPU -->|是| Proc[评估 multiprocessing]
  CPU -->|IO 等待为主| Thr[评估 threading / asyncio]
  CPU -->|扩展释放 GIL 或 free-threaded| Bench[测试线程并行收益与安全性]`,
    },
  ],
  "python/asgi": [
    {
      kind: "mermaid",
      title: "WSGI / ASGI",
      source: `flowchart TB
  WSGI[WSGI 同步调用接口] --> SyncApp[同步请求处理]
  ASGI[ASGI 异步事件接口] --> AsyncApp[Django 异步视图 / FastAPI / Channels]
  ASGI --> Adapter[同步代码仍需适配与隔离]
  ASGI --> Long[可支持长连接：取决于服务器与应用实现]`,
    },
  ],
};
