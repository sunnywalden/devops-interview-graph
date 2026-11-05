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
      title: "Kaniko → Artifactory",
      source: `flowchart LR
  Ctx[构建上下文] --> Kaniko
  Kaniko --> Reg[Artifactory 镜像]
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
  Gate -->|过线| Stop[停并回滚镜像+配置]
  Gate -->|守住| More[加大权重或副本]`,
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
      title: "Runner 标签与容量",
      source: `flowchart TB
  Job[Job tags] --> Match[匹配 Runner]
  Match --> Cap[并发/资源配额]
  Cap --> Iso[租户或环境隔离]`,
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
  T1[目标A] -->|scrape| P1[Prom 区域]
  T2[目标B] -->|scrape| P2[Prom 区域]
  P1 -->|federation| Central[中央 Prom]
  P2 -->|federation| Central
  Central --> Graf[Grafana]`,
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
        { from: "exp", to: "p", label: "pull" },
        { from: "p", to: "fed" },
        { from: "p", to: "am", label: "告警" },
      ],
    },
  ],
  "monitor/slo": [
    {
      kind: "mermaid",
      title: "SLO / 错误预算",
      source: `flowchart LR
  SLI[SLI 实测] --> SLO[SLO 目标]
  SLO --> Budget[错误预算]
  Budget -->|耗尽| Freeze[冻结发版/保稳定]
  Budget -->|充裕| Ship[可继续迭代]`,
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
  MQ --> Cons[消费端接上同一棵树]
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
  TF->>BE: 获取锁
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
  Req[请求 + IdemKey] --> Store{已成功?}
  Store -->|是| Replay[返回原结果]
  Store -->|否| Exec[执行并记录]`,
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
  W1->>L: 持有租约 token=1
  W1--xL: 租约过期
  W2->>L: 抢租约 token=2
  W1->>L: 写操作带 token=1
  L-->>W1: 拒绝(fencing)`,
    },
    {
      kind: "flow",
      title: "互斥折旧示意",
      nodes: [
        { id: "job", label: "折旧任务", x: 40, y: 80 },
        { id: "lease", label: "租约", detail: "TTL + token", x: 220, y: 80 },
        { id: "write", label: "写资产", x: 400, y: 80 },
      ],
      edges: [
        { from: "job", to: "lease", label: "抢锁" },
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
  S3 -->|失败| C3[补偿3]
  C3 --> C2[补偿2]
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
  UI[看板] --> API
  API --> Pre[(预计算表)]
  Pre --> Raw[(原始明细)]`,
    },
  ],
  "other/nacos": [
    {
      kind: "mermaid",
      title: "配置中心推送",
      source: `flowchart LR
  Nacos[配置中心] -->|监听| App[服务实例]
  App --> Reload[热更新 / 重启策略]`,
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
