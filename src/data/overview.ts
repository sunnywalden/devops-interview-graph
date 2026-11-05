import type { StarStory, SprintDay } from "../types";

export const narrative =
  "我做了大概 13 年 DevOps 和平台开发。知识按三层串，不是一条运行时调用链：①语言层里 Golang 和 Python 都是我的主开发语言，并列——Go 偏服务/Worker/工程化，Python 偏权限平台/审计/Exporter；②中间件/基础设施（MySQL、Mongo、Redis、MQ、Docker、K8s，以及 DNS/TLS）承托数据与运行；③DevOps 场景（CI/CD 含供应链与 Runner、监控 SLO、日志链路、运维平台 IaC/GitOps、CMDB、报表、密钥/oncall/容量等）用前两层把平台做出来。数字只报简历写过的：可用性 99.9999%、成本大概降了 40%。";

export const layerSteps = [
  {
    title: "① 语言层（并列主开发语言）",
    detail:
      "Golang：GMP/ctx/channel、interface/error、同步与优雅退出、测试与 GC、go-zero/GraphQL。Python：GIL/asyncio、Django 权限、Exporter、typing/Pydantic、多进程、Poetry、WSGI/ASGI、运维标准库。两边都是开发语言，不是『Go 主、Python 附属脚本』。",
  },
  {
    title: "② 中间件 / 基础设施",
    detail:
      "MySQL（索引/隔离/死锁/主从）、Mongo（索引/事务/副本/分片）、Redis（结构选型/缓存防护/集群/热 key）、MQ（可靠/积压/顺序/选型）、Docker/K8s（架构与组件、工作负载、网络存储、探针滚动、Service、RBAC、排障）、DNS/CoreDNS/TLS/证书。",
  },
  {
    title: "③ DevOps 场景",
    detail:
      "GitLab CI 专区（含供应链扫描、Runner 容量）、监控（黄金信号/联邦/SLO/告警疲劳）、日志（ELK + 结构化链路）、运维平台（Terraform/GitOps）、CMDB 一致性、报表，以及配置/审计/备份/密钥/oncall/容量。",
  },
  {
    title: "回总览收口",
    detail: "STAR 与 3～5 天冲刺只在本页统一调度；细节下钻到对应子页。换页/换下拉进度由本机书签自动保存。",
  },
];

export const diagramNodes = [
  { id: "go", label: "Golang", detail: "主开发语言 · 服务/Worker", layer: 1 },
  { id: "py", label: "Python", detail: "主开发语言 · 平台/自动化", layer: 1 },
  { id: "mysql", label: "MySQL", detail: "关系库/事务", layer: 2 },
  { id: "mongo", label: "MongoDB", detail: "文档库/副本", layer: 2 },
  { id: "redis", label: "Redis", detail: "缓存/热 key", layer: 2 },
  { id: "mq", label: "消息 MQ", detail: "可靠/顺序/积压", layer: 2 },
  { id: "docker", label: "Docker", detail: "镜像/容器", layer: 2 },
  { id: "k8s", label: "Kubernetes", detail: "架构/编排", layer: 2 },
  { id: "net", label: "DNS/TLS", detail: "解析与证书", layer: 2 },
  { id: "cicd", label: "CI/CD", detail: "GitLab+供应链", layer: 3 },
  { id: "monitor", label: "监控", detail: "Prom/SLO/告警", layer: 3 },
  { id: "log", label: "日志", detail: "ELK/结构化", layer: 3 },
  { id: "ops", label: "运维平台", detail: "IaC/GitOps", layer: 3 },
  { id: "cmdb", label: "CMDB", detail: "资产/一致性", layer: 3 },
  { id: "report", label: "报表", detail: "看板/预计算", layer: 3 },
  { id: "other", label: "其他", detail: "密钥/oncall/容量", layer: 3 },
];

export const starStories: StarStory[] = [
  {
    id: "mingfu",
    label: "CMDB / 固定资产",
    role: "Go 平台 · CMDB + 固定资产",
    layerMap: "语言 Go/go-zero → 中间件 Mongo/MQ → 场景 CMDB/报表",
    s: "做 CMDB 和固定资产。概览要聚合，直查太贵；折旧绝不能双跑；跨系统变更拖长事务撑不住。读多形查询还要对内 gRPC、对外 REST/GraphQL。",
    t: "我扛核心服务：模型、预计算、折旧互斥，还有跨系统最终一致；同时把超时取消、幂等和可观测嵌进日常交付。",
    a: "服务用 go-zero，对外 REST/GraphQL、对内 gRPC。概览做成 Worker 预计算加 BulkWrite，有界并发和 ctx 取消。折旧抢租约带 fencing token。跨系统拆步补偿，消息走 MQ，顺序按业务键。短事务保本地不变量，配置挂 Nacos，错误可包装可判断。",
    r: "读写拆开了，概览和折旧能稳定跑。出故障时靠幂等、租约和状态机收敛，不靠运气；排障能顺着 trace 和版本对账。",
    followUp:
      "怎么保证只跑一次？租约加 token，再加状态机。补偿失败？重试、死信、人工。为啥不用长事务？跨系统一抖就全挂，我宁肯最终一致。预计算漂了？对账作业，不是等用户投诉。GraphQL N+1？DataLoader 和复杂度限制。",
  },
  {
    id: "bili",
    label: "资源效能 / 日志",
    role: "CMDB / 资源效能 / 日志",
    layerMap: "中间件 MySQL/Redis → 场景日志/监控降本",
    s: "做资源效能和日志。读多写少，库和日志集群又贵又不稳；慢 SQL 和缓存失效会互相放大。",
    t: "目标很明确：可用性拉上去，成本压下来；过程上把 SQL、缓存、日志生命周期一起治。",
    a: "业务侧上本地加 Redis 二级缓存，SQL 和索引一起抠，击穿单飞、穿透空值。日志侧 Mapping 写死，上 ILM，查询走代理限流；字段规范防止爆炸。",
    r: "可用性做到 99.9999%，成本大概降了 40%。这两个数简历上有，我只报这两个；方法上强调缓存不是真相、日志要控成本。",
    followUp:
      "击穿怎么防？单飞合并回源，穿透垫空值。一致性？写后删缓存，跟产品谈 SLA。冷数据？ILM 降级，该归档归档。热 key？本地缓存加拆分。隔离级别？讲原理，不吹未做过的调参。",
  },
  {
    id: "tezign",
    label: "运维平台 / CI·监控·审计",
    role: "运维平台 / CI / 监控 / 审计",
    layerMap: "语言 Python → 中间件 K8s → 场景 CI/运维平台/监控",
    s: "云资源、发布、监控、SQL 变更散落各处，多租户一不小心就越权；CI 复制粘贴难以治理。",
    t: "我要把这些收成一套平台：同一套权限，同一套工具链，发布可复跑，操作可审计。",
    a: "多云用 Terraform（远程 state+锁）。CI 走 GitLab Templates，Kaniko 构建，Artifactory 存制品，质量与供应链扫描门禁，Runner 按标签隔离，研发测试可一键部署。监控 Influx 加 Prometheus 联邦，告警可行动。权限用 Django 按租户过滤。SQL 审计按租户协程配额隔离。缺指标用 Python 写 Exporter。",
    r: "交付能复跑，监控能看清，操作能审计，运维变成产品而不是一堆脚本；多租户隔离和门禁成为默认。",
    followUp:
      "租户打满执行器？配额排队。IaC 漂移？定期 plan。CI 怎么治理？Templates 统一，门禁不许私自关。供应链？高危阻断、例外有到期。Exporter？快，但阻塞和标签基数必须管住。GitOps？讲清与 push CD 的取舍。",
  },
  {
    id: "cr",
    label: "配置中心 / 容器交付",
    role: "配置中心 + 容器交付",
    layerMap: "中间件 K8s → 场景配置/交付",
    s: "多环境配置容易漂，容器交付也不标准；回滚经常只回了一半。",
    t: "配置要能版本化、能回滚；交付要能复制，滚动时流量要接得住。",
    a: "用 Go Template 渲多环境配置，版本跟发布绑死。底下是 OpenStack 上的 K8s，CI 构建镜像再部署，探针、滚动参数和扩缩容按规范来；密钥运行时注入。",
    r: "交付标准化了，配置跟着发布走，回滚也能成套回；近零停机靠 readiness 和排水，不只靠『发完了』。",
    followUp: "密钥？运行时注入或接 KMS，绝不进仓库。回滚？镜像和配置同一版本一起回。探针？liveness 不打库。ConfigMap 热更新？看挂载方式，别想当然。",
  },
  {
    id: "huawei",
    label: "HPC 备份恢复",
    role: "HPC 备份恢复（Java + Shell）",
    layerMap: "场景·其他（备份）；方法可迁移到 Go 岗",
    s: "做 HPC 备份恢复。数据量大，作业窗口紧，备了恢复不了等于没备。",
    t: "我要把备份和恢复做成可重复、能校验的流程，不是靠人肉，也不是只看成功日志。",
    a: "Java 编排流程，Shell 对接存储和作业。窗口里拆增量全量。做校验和，定期抽检真正恢复一把。失败有重试和告警，步骤写进 runbook。",
    r: "HPC 场景备份恢复能交付。我强调可验证，不是日志里写一句『备份成功』就交差；窗口不够就切分并行。",
    followUp:
      "怎么证明恢复成功？校验和，再抽检挂载跑作业。窗口不够？增量、并行、按优先级切分。跟 Go 岗关系？窗口约束、可靠性、自动化与 oncall 思维可迁移。",
  },
];

export const sprint5d: SprintDay[] = [
  {
    label: "Day1 ①语言",
    items: [
      { label: "背", value: "GMP/ctx/channel；iface/error；优雅退出；GIL/asyncio/Django" },
      { label: "扫", value: "go-zero/GraphQL；typing/Poetry/ASGI；Exporter" },
      { label: "练", value: "每卡 90–120 秒×2（加厚口述）" },
    ],
  },
  {
    label: "Day2 ②中间件+CMDB",
    items: [
      { label: "背", value: "Mongo 四卡；Redis 热 key；MQ 积压/顺序；K8s 架构+探针+排障" },
      { label: "扫", value: "MySQL 隔离/死锁/主从；DNS/证书" },
      { label: "练", value: "CMDB STAR + 幂等/Lease" },
    ],
  },
  {
    label: "Day3 ③交付",
    items: [
      { label: "背", value: "GitLab CI 八卡（含供应链/Runner）；探针滚动；GitOps 对比" },
      { label: "练", value: "白板 MR→扫描→Kaniko→部署→Ready" },
    ],
  },
  {
    label: "Day4 ③平台可见性",
    items: [
      { label: "练", value: "资源效能 + 运维平台 STAR" },
      { label: "补", value: "SLO/告警疲劳；结构化日志；密钥/oncall；配置交付与 HPC 备份各 1 遍" },
    ],
  },
  {
    label: "Day5 模拟",
    items: [
      { label: "上午", value: "一致性/故障/CI/容量追问" },
      { label: "下午", value: "三主 STAR + 三层串讲（含双主语言）" },
      { label: "产出", value: "一页口播稿" },
    ],
  },
];

export const sprint3d: SprintDay[] = [
  {
    label: "Day1",
    items: [
      { label: "内容", value: "①语言核心（Go+Python）+ ③CMDB 一致性" },
      { label: "产出", value: "CMDB STAR" },
    ],
  },
  {
    label: "Day2",
    items: [
      { label: "内容", value: "③GitLab CI 八卡 + ②K8s 架构/探针/排障 + 运维平台/Terraform" },
      { label: "产出", value: "CI→K8s 白板 + 运维平台要点" },
    ],
  },
  {
    label: "Day3",
    items: [
      { label: "内容", value: "②Redis/Mongo/MQ + ③监控 SLO/日志链路 + 资源效能 STAR + 模拟" },
      { label: "补", value: "密钥/oncall/容量；配置交付与 HPC 备份各 5 分钟" },
    ],
  },
];

export const sprintTips = [
  "按层打开子页 → 先背『一句话』再背原理短句 → 脱稿 90–120 秒（卡片已加厚）",
  "场景提问先答场景，再下钻中间件/语言；被问语言细节再上提场景价值；Go/Python 并列主语言",
  "GitLab CI 八卡必须能讲清：stages/needs/rules、Templates、门禁、Kaniko、MR、一键部署、供应链、Runner",
  "高频加餐：SLO/错误预算、告警疲劳、结构化日志+trace、Terraform state、GitOps vs push、密钥、oncall、容量",
  "主 STAR 录音超时 100 秒就删减；数字只用 99.9999% 与约 -40%",
];

export const checklist = [
  "①语言层 Go：GMP/ctx/channel、iface/nil、error wrap、Mutex/sync.Map、优雅退出、表驱动测试、GC、go-zero/GraphQL",
  "①语言层 Python：GIL/asyncio、Django 多租户、Exporter、typing/Pydantic、多进程、Poetry、WSGI/ASGI、标准库脚本",
  "②中间件：MySQL 索引+隔离+死锁+主从；Mongo 索引/事务/副本/分片；Redis 结构选型+防护+集群+热 key；MQ 可靠+积压+顺序+选型",
  "②中间件 K8s：架构与组件、Pod 控制器、CNI 与存储、探针滚动、Config/Secret、Service/Ingress、RBAC、NetworkPolicy、etcd、排障；DNS/CoreDNS/TLS/证书",
  "③场景 CI：GitLab 八卡（含供应链/Runner/金丝雀）；监控黄金信号/联邦/SLO/告警疲劳；日志 ELK+结构化链路+追踪",
  "③场景：运维平台+Terraform+GitOps；CMDB 四卡；报表；Nacos/审计/备份/密钥/oncall/容量",
  "总览：CMDB、资源效能、运维平台 STAR 录音≤90s；配置交付与 HPC 备份各过一遍；只报简历已有数字",
];
