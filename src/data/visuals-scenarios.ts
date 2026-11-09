import type { CardVisual } from "../types";

export const scenarioVisuals: Record<string, CardVisual[]> = {
  "cicd/stages": [
    {
      kind: "mermaid",
      title: "stages / jobs / needs",
      source: `flowchart LR
  subgraph stage_build[stage: build]
    J1[compile]
  end
  subgraph stage_test[stage: test]
    J2[unit]
    J3[lint]
  end
  subgraph stage_deploy[stage: deploy]
    J4[deploy]
  end
  J1 --> J2
  J1 --> J3
  J2 -->|needs| J4
  J3 -->|needs| J4`,
    },
    {
      kind: "flow",
      title: "并行与依赖",
      nodes: [
        { id: "b", label: "build", x: 40, y: 80 },
        { id: "t1", label: "test", x: 220, y: 20 },
        { id: "t2", label: "scan", x: 220, y: 140 },
        { id: "d", label: "deploy", x: 400, y: 80 },
      ],
      edges: [
        { from: "b", to: "t1" },
        { from: "b", to: "t2" },
        { from: "t1", to: "d", label: "needs" },
        { from: "t2", to: "d", label: "needs" },
      ],
    },
  ],
  "cicd/templates": [
    {
      kind: "mermaid",
      title: "include 模板",
      source: `flowchart TB
  Root[.gitlab-ci.yml] --> Inc[include 模板]
  Inc --> Vars[变量分层]
  Vars --> Jobs[具体 jobs]`,
    },
  ],
  "cicd/quality": [
    {
      kind: "mermaid",
      title: "cache / artifacts / 门禁",
      source: `flowchart LR
  Cache[cache 依赖] --> Build
  Build --> Art[artifacts]
  Art --> Sonar[Sonar 门禁]
  Sonar --> Next[下游 job]`,
    },
  ],
  "cicd/kaniko": [
    {
      kind: "mermaid",
      title: "构建器 → 镜像仓库",
      source: `flowchart LR
  Ctx[构建上下文与 Dockerfile] --> Builder[维护中的构建器：如 BuildKit]
  Builder --> Reg[Artifactory 等镜像仓库]
  Reg --> Deploy[部署引用 digest]`,
    },
  ],
  "cicd/mrpipe": [
    {
      kind: "mermaid",
      title: "MR 管道 vs 分支管道",
      source: `flowchart TB
  MR[Merge Request] --> MRP[MR pipeline]
  Branch[默认分支] --> BP[Branch pipeline]
  MRP --> Gate[质量/安全门禁]
  BP --> Release[可部署产物]`,
    },
  ],
  "cicd/canary": [
    {
      kind: "mermaid",
      title: "金丝雀放量",
      source: `flowchart LR
  Base[基线] --> Gate{黄金信号}
  Canary[小流量新版本] --> Gate
  Gate -->|超过失败阈值| Stop[停止放量并执行回滚方案]
  Gate -->|满足观察条件| More[逐步提高流量权重]
  Stop --> State[核对配置与数据变更的兼容性]`,
    },
  ],
  "cicd/deploy": [
    {
      kind: "flow",
      title: "CD 一键部署",
      nodes: [
        { id: "btn", label: "一键部署", detail: "研发自助", x: 40, y: 80 },
        { id: "job", label: "CD Job", x: 220, y: 80 },
        { id: "img", label: "制品/镜像", x: 220, y: 200 },
        { id: "k8s", label: "目标集群", x: 400, y: 80 },
      ],
      edges: [
        { from: "btn", to: "job" },
        { from: "img", to: "job" },
        { from: "job", to: "k8s" },
      ],
    },
  ],
  "cicd/supply": [
    {
      kind: "mermaid",
      title: "供应链扫描门禁",
      source: `flowchart LR
  Src[源码/依赖] --> SCA[依赖扫描]
  Img[镜像] --> CIS[镜像扫描]
  SCA --> Gate{门禁}
  CIS --> Gate
  Gate -->|阻断| Fail[失败]
  Gate -->|通过| Pass[继续]`,
    },
  ],
  "cicd/runners": [
    {
      kind: "mermaid",
      title: "Runner 匹配与隔离",
      source: `flowchart TB
  Job[Job tags] --> Match[匹配 Runner]
  Match --> Cap[并发/资源配额]
  Match --> Iso[另行配置执行器、凭据与网络隔离]
  Iso --> Boundary[标签本身不是安全边界]`,
    },
  ],
  "monitor/golden": [
    {
      kind: "mermaid",
      title: "黄金信号",
      source: `flowchart TB
  Lat[延迟] --> Decide[排障决策]
  Traf[流量] --> Decide
  Err[错误] --> Decide
  Sat[饱和度] --> Decide`,
    },
  ],
  "monitor/prom": [
    {
      kind: "mermaid",
      title: "Prometheus 拉取 / 联邦",
      source: `flowchart LR
  P1[Prom 区域 A] -->|scrape 请求| T1[目标 A]
  P2[Prom 区域 B] -->|scrape 请求| T2[目标 B]
  Central[中央 Prom] -->|拉取 federation 端点| P1
  Central -->|拉取 federation 端点| P2
  Graf[Grafana] -->|查询| Central`,
    },
    {
      kind: "flow",
      title: "拉取拓扑",
      nodes: [
        { id: "exp", label: "Exporter", x: 40, y: 80 },
        { id: "p", label: "Prometheus", x: 220, y: 80 },
        { id: "fed", label: "联邦", x: 400, y: 80 },
        { id: "am", label: "Alertmanager", x: 220, y: 200 },
      ],
      edges: [
        { from: "p", to: "exp", label: "拉取指标" },
        { from: "fed", to: "p", label: "拉取选定序列" },
        { from: "p", to: "am", label: "告警" },
      ],
    },
  ],
  "monitor/slo": [
    {
      kind: "mermaid",
      title: "SLO / 错误预算",
      source: `flowchart LR
  SLI[有效事件与良好事件的计量] --> Used[计算失败比例与预算消耗]
  SLO[SLO 目标及时间窗口] --> Budget[允许的错误预算]
  Used --> Policy[根据消耗和燃烧率执行约定策略]
  Budget --> Policy
  Policy --> Freeze[必要时限制发布并优先修复]
  Policy --> Ship[满足条件时继续迭代]`,
    },
  ],
  "monitor/alertfatigue": [
    {
      kind: "mermaid",
      title: "告警疲劳治理",
      source: `flowchart TB
  Noise[噪音告警] --> Action{可行动?}
  Action -->|否| Drop[删/降级]
  Action -->|是| Route[路由到人]
  Route --> Runbook[附 runbook]`,
    },
  ],
  "log/elk": [
    {
      kind: "mermaid",
      title: "ELK + ILM",
      source: `flowchart LR
  App --> Beat[采集]
  Beat --> ES[(Elasticsearch)]
  ES --> ILM[热→温→冷→删]
  ES --> Kibana`,
    },
  ],
  "log/trace": [
    {
      kind: "mermaid",
      title: "trace 穿过同步和队列",
      source: `flowchart LR
  In[入口 trace id] --> RPC[RPC 协议头]
  RPC --> Span[子 span]
  In --> MQ[消息头]
  MQ --> Cons[消费端按语义创建子 span 或 span link]
  Span --> Log[日志打同一个 id]`,
    },
  ],
  "log/structured": [
    {
      kind: "mermaid",
      title: "结构化日志与链路",
      source: `flowchart LR
  Log[JSON 日志] --> Trace[trace_id]
  Trace --> Span[span]
  Log --> Fields[稳定字段]
  Fields --> Index[可检索]`,
    },
  ],
  "ops/platform": [
    {
      kind: "flow",
      title: "运维平台能力地图",
      nodes: [
        { id: "portal", label: "门户", detail: "统一入口", x: 200, y: 20 },
        { id: "iam", label: "权限", detail: "多租户", x: 40, y: 120 },
        { id: "ci", label: "CI/CD", x: 200, y: 120 },
        { id: "mon", label: "监控", x: 360, y: 120 },
        { id: "audit", label: "审计", x: 200, y: 220 },
      ],
      edges: [
        { from: "portal", to: "iam" },
        { from: "portal", to: "ci" },
        { from: "portal", to: "mon" },
        { from: "iam", to: "audit" },
        { from: "ci", to: "audit" },
      ],
    },
  ],
  "ops/terraform": [
    {
      kind: "mermaid",
      title: "State / Lock",
      source: `sequenceDiagram
  participant Dev
  participant TF as Terraform
  participant BE as Remote State
  Dev->>TF: plan/apply
  TF->>BE: 后端支持且已启用时获取状态锁
  TF->>BE: 读写 state
  TF->>BE: 释放锁`,
    },
  ],
  "ops/gitops": [
    {
      kind: "mermaid",
      title: "GitOps vs Push CD",
      source: `flowchart TB
  subgraph Push
    CI1[CI] -->|kubectl apply| Clu1[集群]
  end
  subgraph GitOps
    Git[Git 声明] --> Ctrl[控制器调谐]
    Ctrl --> Clu2[集群]
  end`,
    },
  ],
  "cmdb/idem": [
    {
      kind: "mermaid",
      title: "幂等",
      source: `flowchart LR
  Req[请求、作用域与幂等键] --> Claim[唯一约束或原子操作登记请求摘要]
  Claim --> State{登记结果}
  State -->|相同请求已成功| Replay[返回已保存结果]
  State -->|键相同但参数不同| Reject[拒绝冲突请求]
  State -->|正在处理或结果未知| Wait[等待、查询或对账]
  State -->|获得执行权| Exec[执行业务与记录结果]
  Exec --> Commit[同库事务提交；跨系统另行协调]`,
    },
  ],
  "cmdb/lease": [
    {
      kind: "mermaid",
      title: "Lease / Fencing",
      source: `sequenceDiagram
  participant W1 as Worker旧
  participant L as Lease服务
  participant W2 as Worker新
  participant R as 受保护资源
  L-->>W1: 授予租约及单调 token=1
  Note over W1,L: 旧 Worker 暂停，租约过期
  L-->>W2: 授予新租约及 token=2
  W2->>R: 写入携带 token=2
  R->>R: 原子校验 token 并更新数据与最大 token
  W1->>R: 恢复后尝试写入 token=1
  R-->>W1: 拒绝旧 token
  Note over L,R: 资源端必须实现校验；租约过期本身不会撤销旧进程`,
    },
    {
      kind: "flow",
      title: "互斥折旧示意",
      nodes: [
        { id: "job", label: "折旧任务", x: 40, y: 80 },
        { id: "lease", label: "租约", detail: "TTL + 单调递增 token", x: 220, y: 80 },
        { id: "write", label: "资源端写入", detail: "原子校验 token 并更新", x: 400, y: 80 },
      ],
      edges: [
        { from: "job", to: "lease", label: "申请执行权" },
        { from: "lease", to: "write", label: "带 fencing token" },
      ],
    },
  ],
  "cmdb/saga": [
    {
      kind: "mermaid",
      title: "Saga 补偿",
      source: `flowchart LR
  S1[步骤1] --> S2[步骤2]
  S2 --> S3[步骤3]
  S3 -->|明确失败且未生效| C2[补偿已提交步骤2]
  S3 -->|结果未知| Check[先查询或对账确认状态]
  Check --> Plan[按实际生效步骤执行补偿]
  C2 --> C1[补偿1]`,
    },
  ],
  "cmdb/worker": [
    {
      kind: "mermaid",
      title: "预计算 Worker",
      source: `flowchart TB
  Trig[定时/事件] --> Q[有界队列]
  Q --> W[Worker 池]
  W --> Bulk[BulkWrite]
  W --> Ctx[ctx 取消]`,
    },
  ],
  "report/board": [
    {
      kind: "mermaid",
      title: "报表读路径",
      source: `flowchart LR
  UI[看板] -->|查询| API
  API -->|读取汇总| Pre[(预计算表)]
  Raw[(原始明细)] -->|增量或批量计算| Worker[计算任务]
  Worker -->|带版本与水位写入| Pre
  API -->|必要时明细下钻| Raw`,
    },
  ],
  "other/nacos": [
    {
      kind: "mermaid",
      title: "配置中心推送",
      source: `flowchart LR
  App[服务实例] -->|订阅配置变化| Nacos[配置中心]
  Nacos -->|变更通知| App
  App --> Fetch[读取并校验新配置]
  Fetch --> Reload[原子替换可热更新项或受控重启]`,
    },
  ],
  "other/secrets": [
    {
      kind: "mermaid",
      title: "密钥流转",
      source: `flowchart TB
  Vault[密钥库] --> Inject[注入运行时]
  Inject --> App
  Git[仓库] -.->|禁止明文| X[X]`,
    },
  ],
  "other/oncall": [
    {
      kind: "mermaid",
      title: "Oncall 响应",
      source: `flowchart LR
  Alert --> Page[值班]
  Page --> Triage[分流]
  Triage --> Mitigate[止血]
  Mitigate --> Postmortem[复盘]`,
    },
  ],
  "other/capacity": [
    {
      kind: "mermaid",
      title: "容量闭环",
      source: `flowchart LR
  Metric[利用率] --> Forecast[预测]
  Forecast --> Scale[扩缩容]
  Scale --> Review[复盘配额]`,
    },
  ],
};
