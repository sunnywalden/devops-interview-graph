import { card } from "../i18n/contentTypes";
import { bilingualTopics } from "./bilingualGroup";

export const kubernetesAdvanced = bilingualTopics("container", {
  "k8s-autoscaling": {
    sources: ["k8s-hpa", "k8s-node-autoscaling", "k8s-resource"],
    zh: card(
      "Kubernetes HPA 与扩容排障",
      "区分副本扩缩、资源请求与节点容量，追踪扩容从指标到就绪的全过程。",
      "以请求激增后扩容仍然超时为例，检查指标、调度和应用预热。",
      "HPA 周期性读取指标并调整目标工作负载的副本数。以 CPU 利用率为目标时，比较的是 CPU 使用量与资源请求的比值。相关容器缺少请求时，相应 Pod 的利用率无法按该指标计算。检查指标可用性、HPA 条件、最小和最大副本数及扩缩行为。\n\n新增 Pod 还需能调度、拉取镜像并通过就绪探针。节点自动扩容处理可调度容量，垂直伸缩调整资源请求，解决的约束不同。端到端效果用队列等待、尾延迟和新增副本就绪时间验证。",
      ["启动期、就绪状态和缺失指标会影响 HPA 的计算和扩缩速度。", "选择能反映负载的指标，例如积压或每副本请求量，并验证它与可用容量的关系。"],
      ["没有配置 CPU 请求便期待基于 CPU 利用率的 HPA 按预期扩容。", "只看 HPA 想要的副本数，忽略 Pending 或未 Ready 的 Pod。"],
      [
        ["HPA 的 70% CPU 目标以什么为分母？", "对基于资源利用率的 CPU 指标，以对应资源请求为基准。CPU 限额和节点核数都不是该目标的分母。"],
        ["HPA 已增加副本，为什么服务仍超时？", "核对新增 Pod 能否调度、镜像拉取、启动和就绪情况，以及流量是否分配给它们。再检查下游、连接池或单分区热点。"],
        ["为什么刚降载却没立刻缩容？", "HPA 的缩容稳定窗口、策略和缺失指标等都可能使缩容更保守。查看 behavior、事件和指标历史。"],
        ["节点扩容和 HPA 如何配合？", "HPA 调整副本目标。容量不足时，支持的节点自动伸缩器可依据未能调度的 Pod 供应节点，是否成功还取决于配额、约束和容量。"],
        ["什么时候适合用队列指标？", "消费压力能由积压量或最老任务等待反映，且增加消费者确实能提高吞吐时。结合分区数、依赖容量、指标滞后和压测确定目标。"],
      ],
    ),
    en: card(
      "Kubernetes HPA and scaling diagnosis",
      "Separate replica scaling, resource requests, and node capacity, then trace scaling from metrics to readiness.",
      "Use a traffic spike with persistent timeouts to check metrics, scheduling, and warm-up.",
      "The HPA periodically reads metrics and adjusts the target workload's replica count. A CPU utilization target compares usage to resource requests. A Pod's utilization cannot be computed for that metric if relevant containers lack requests. Check metric availability, HPA conditions, minimum and maximum replicas, and scaling behavior.\n\nNew Pods must still schedule, pull images, and become ready. Node autoscaling supplies schedulable capacity and vertical scaling adjusts requests, addressing different constraints. Verify end-to-end impact with queue wait, tail latency, and time for new replicas to become ready.",
      ["Startup, readiness, and missing metrics can affect HPA calculation and scaling speed.", "Choose a signal tied to demand, such as backlog or requests per replica, and validate its relationship to available capacity."],
      ["Expecting a CPU utilization target to work as intended without CPU requests.", "Watching only the HPA's desired replica count and overlooking Pending or unready Pods."],
      [
        ["What is the denominator in a 70% CPU utilization target?", "For a CPU resource utilization metric, the baseline is the corresponding CPU request. CPU limits and node CPU count do not define that target."],
        ["Why can requests still time out after the HPA adds replicas?", "Check scheduling, image pulls, startup, readiness, and whether traffic reaches new Pods. Then inspect downstream capacity, connection pools, and partition hotspots."],
        ["Why doesn't the workload immediately scale down when demand falls?", "The downscale stabilization window, policies, and missing metrics can make downscaling conservative. Check behavior, events, and metric history."],
        ["How do node autoscaling and the HPA work together?", "The HPA adjusts the replica target. When capacity is insufficient, a supported node autoscaler can provision nodes in response to unschedulable Pods, subject to quotas, constraints, and available capacity."],
        ["When is a queue metric a good target?", "Use it when backlog or oldest age represents pressure and adding consumers increases throughput. Check partition count, downstream limits, metric lag, and load-test results."],
      ],
    ),
  },
  "k8s-controllers": {
    sources: ["k8s-controller", "k8s-api-concepts", "k8s-finalizers", "k8s-owners", "k8s-workqueue"],
    zh: card(
      "Kubernetes Controller 与 Operator",
      "解释期望状态、调谐循环、并发更新和删除清理，覆盖控制器重启与事件合并。",
      "以 CRD 管理一个外部资源为例，设计可重复执行的创建、更新和回收。",
      "控制器通常通过 watch 或 informer 观察对象，将键加入工作队列，调谐时读取当前状态并逐步逼近期望状态。事件可能合并，缓存可能暂时滞后，进程也会重启，所以调谐应可重复执行。Operator 将应用运维知识编码进控制器，常配合自定义资源。\n\n用 resourceVersion 检测读改写冲突，遇到冲突后按最新状态重算。要在删除前清理外部资源，可设置 finalizer，在观察到 deletionTimestamp 后完成可重试的清理，再移除 finalizer。",
      ["将观察到的进展和失败原因写入 status，区分期望配置与实际结果。", "用 metadata.ownerReferences 表达 Kubernetes 对象之间的所有权。外部资源清理需要独立机制。"],
      ["把每个 watch 事件当作恰好执行一次的业务命令。", "对持久错误立即无限重排队，压垮 API server 或外部服务。"],
      [
        ["为什么调谐要按当前状态而不是事件内容执行？", "同一键可能多次入队或合并，控制器也可能错过中间状态。读取当前期望与实际状态，按差异执行可重复操作。如果 watch 所需版本已不再保留，收到 410 Gone 后重新 list，并从新列表的 resourceVersion 建立 watch；标准 informer 会管理列表与 watch。"],
        ["更新遇到 409 Conflict 怎么处理？", "重新读取对象和 resourceVersion，再基于当前数据重算更新。保持重试有界并避免覆盖其他控制器的字段。"],
        ["finalizer 为什么可能导致对象一直 Terminating？", "对象设置了 deletionTimestamp 但仍有 finalizer 时，API server 会保留它。检查对应控制器、权限及清理结果，确认后按其契约移除。"],
        ["metadata.ownerReferences 能代替清理外部资源吗？", "它服务于 Kubernetes 对象的垃圾回收。对云资源或其他外部状态，需要自己的标识、清理和故障恢复策略。"],
        ["怎样避免重启后重复创建外部资源？", "为外部资源使用稳定标识或幂等令牌，创建前按标识查询并能接管已有资源。对暂时失败限速重试并记录状态。"],
      ],
    ),
    en: card(
      "Kubernetes controllers and operators",
      "Explain desired state, reconciliation, concurrent updates, and deletion cleanup across restarts and coalesced events.",
      "Design repeatable creation, updates, and cleanup for an external resource managed through a CRD.",
      "Controllers commonly observe objects through a watch or informer, queue keys, and reconcile current state toward desired state. Events can coalesce, caches can lag, and processes restart, so reconciliation should be repeatable. An operator encodes application operations in a controller, often with a custom resource.\n\nUse resourceVersion to detect read-modify-write conflicts and recompute on fresh state after a conflict. When external cleanup must precede deletion, add a finalizer. After observing deletionTimestamp, complete retryable cleanup and remove the finalizer.",
      ["Write observed progress and failure reasons to status, separating desired configuration from actual results.", "Use metadata.ownerReferences for ownership between Kubernetes objects. External resources need their own cleanup mechanism."],
      ["Treating each watch event as an exactly-once business command.", "Immediately requeueing persistent failures indefinitely and overwhelming the API server or an external service."],
      [
        ["Why reconcile current state rather than executing from the event payload?", "A key can be queued repeatedly or coalesced, and a controller can miss intermediate states. Read current desired and actual state and apply repeatable operations based on the difference. If a watch gets 410 Gone because its version is no longer retained, list again and watch from the new list's resourceVersion. Standard informers manage list and watch."],
        ["How do you handle 409 Conflict on an update?", "Reread the object and resourceVersion, then recompute the update from current data. Bound retries and avoid overwriting fields owned by other controllers."],
        ["Why can a finalizer leave an object Terminating?", "The API server retains an object with deletionTimestamp while finalizers remain. Inspect the responsible controller, permissions, and cleanup result, then remove the finalizer according to its contract once confirmed."],
        ["Can metadata.ownerReferences replace external cleanup?", "It supports garbage collection of Kubernetes objects. Cloud resources and other external state need their own identity, cleanup, and recovery strategy."],
        ["How do you avoid creating an external resource twice after a restart?", "Use a stable identifier or idempotency token and look it up before creation so you can adopt existing state. Rate-limit retries for transient failures and record status."],
      ],
    ),
  },
});
