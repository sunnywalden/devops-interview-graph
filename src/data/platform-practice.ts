import { card } from "../i18n/contentTypes";
import { bilingualTopics } from "./bilingualGroup";

export const platformPractice = bilingualTopics("ops", {
  "git-workflow": {
    sources: ["git-rebase", "git-revert", "git-bisect", "git-merge"],
    zh: card(
      "Git 分支、回退与变更定位",
      "区分合并、变基、反向提交和二分查找，按历史是否共享选择操作。",
      "以主干回归和发布回退为例，保留可追踪的变更记录并验证部署结果。",
      "merge 整合分支历史，可能快进或创建合并提交。rebase 将提交重放到新基底，通常会产生新的提交标识。对其他人正在依赖的提交，改写历史要协调。已共享的错误变更一般用 revert 产生反向提交。\n\n用 git bisect 标记已知好坏提交，通过可重复的测试定位首次出现问题的提交。代码回退只是一步，还要核对部署产物、数据库兼容性和实际服务状态。",
      ["同一个 commit 可用于追踪构建产物。线上回退应校验实际产物和环境。", "回退 merge 时要明确选用哪个父提交作为主线。"],
      ["把 reset --hard 当作共享主干的常规回退方法。", "用不稳定测试运行 bisect，将偶发失败误标为坏提交。"],
      [
        ["merge 和 rebase 在提交图上有什么区别？", "merge 保留被整合的提交图，必要时加合并提交。rebase 将变更重放到新的基底，通常产生新提交标识。"],
        ["已推送的错误提交如何回退？", "通常用 git revert 提交相反变更，保留共享历史。先检查后续依赖该变更的提交和部署兼容性。"],
        ["为什么 revert 合并提交要指定 -m？", "合并有多个父提交，Git 需要知道以哪个父作为主线来计算应反转的差异。这也会影响后续重新合并的结果。"],
        ["怎样定位间歇性回归的引入提交？", "先让复现足够稳定，再标记已知好坏边界并运行 bisect。无法测试的提交可标记 skip，最终结合变更证据验证。"],
        ["代码已回退，为什么服务仍可能异常？", "运行的镜像可能未切换，配置或数据库迁移可能不兼容，也可能有不可逆数据变更。检查实际部署版本、依赖和健康指标。"],
      ],
    ),
    en: card(
      "Git branching, rollback, and regression isolation",
      "Separate merging, rebasing, reverting, and bisection. Choose operations based on whether history is shared.",
      "Use a mainline regression and release rollback to keep changes traceable and verify deployment results.",
      "A merge integrates branch history, either by fast-forwarding or by creating a merge commit as appropriate. A rebase replays commits onto a new base and usually gives them new identities. Coordinate rewrites of commits other people depend on. For a faulty shared change, revert normally records an inverse commit.\n\nUse git bisect with known good and bad commits and a repeatable test to find where the issue first appears. A code revert is one step. Check the deployed artifact, schema compatibility, and live service state.",
      ["A commit can identify a build artifact. Verify the actual artifact and environment during rollback.", "When reverting a merge, identify which parent is the mainline."],
      ["Using reset --hard as a routine rollback for a shared main branch.", "Running bisect with a flaky test and marking intermittent failures as bad commits."],
      [
        ["How do merge and rebase affect the commit graph?", "A merge preserves the integrated graph and adds a merge commit when needed. A rebase replays changes onto a new base and normally produces new commit identities."],
        ["How do you undo a faulty commit that was pushed?", "Use git revert to create an inverse change and preserve shared history. Check later commits that depend on the change and compatibility with the deployed environment."],
        ["Why does reverting a merge require -m?", "A merge has multiple parents. Git needs the mainline parent to compute the difference to reverse. That choice also affects what a later merge will reintroduce."],
        ["How do you isolate the commit that introduced an intermittent regression?", "First make reproduction sufficiently reliable, then mark known good and bad endpoints and run bisect. Mark untestable commits as skip and verify the result with change evidence."],
        ["Why might the service still fail after the code is reverted?", "The running image may not have changed, config or migrations may be incompatible, or data changes may be irreversible. Check the deployed version, dependencies, and health metrics."],
      ],
    ),
  },
  ansible: {
    sources: ["ansible-playbooks", "ansible-check", "ansible-strategies", "ansible-logging"],
    zh: card(
      "Ansible 幂等配置与滚动变更",
      "用 inventory、模块、handlers 和串行批次解释可重复、可验证的运维。",
      "以分批更新一组节点的配置为例，设计预检查、服务重载、健康验证和中止条件。",
      "Ansible 用 inventory 表达目标和分组，用 playbook 或 role 组织任务。优先选能描述期望状态的模块，让重复执行收敛到同一状态。对命令类任务，要显式定义执行条件、变更判定与失败判定。handlers 可在任务报告变更后触发重载。\n\n先在代表性节点验证，使用 serial 控制批次，并按变更计划做摘流、更新、健康检查和失败中止。check 与 diff 适合预览支持它们的模块，仍需验证实际变更和敏感数据处理。",
      ["串行批次只控制执行范围，服务健康和失败中止需要明确任务或策略。", "按 inventory 和变量作用域核对目标。敏感值用适当的秘密管理，并避免日志和 diff 暴露。"],
      ["每次执行都重启服务，导致无变更运行也产生中断。", "认为 --check 的结果能预测所有任务及后续依赖。"],
      [
        ["用 command 执行脚本如何避免重复副作用？", "优先使用具备期望状态语义的模块。确需脚本时，设置可验证的前置条件或 creates/removes，明确 changed_when 与 failed_when，并让操作可重入。"],
        ["handler 什么时候触发？", "任务报告 changed 并发出 notify 后，handler 会在约定阶段执行，通常合并同一批通知。若需更早生效，可按顺序使用 flush_handlers。"],
        ["serial 与 forks 有什么区别？", "serial 限制每个 play 批次中的主机范围，forks 限制 Ansible 的并行执行进程数。滚动发布还需健康检查及失败策略。"],
        ["check 和 diff 能保证什么？", "它们预览支持这些模式的任务。依赖前一步实际结果的任务可能无法准确预演。diff 还可能显示敏感内容，要按任务关闭。"],
        ["如何验证配置真正收敛？", "先在目标节点核对文件、进程和服务健康，再以相同输入重跑并确认状态没有意外变化。结合实际服务指标。"],
      ],
    ),
    en: card(
      "Ansible idempotent configuration and rolling changes",
      "Use inventory, modules, handlers, and serial batches to explain repeatable and verifiable operations.",
      "Design prechecks, reloads, health validation, and abort conditions for a staged node configuration change.",
      "Ansible represents targets and groups with inventory and organizes tasks in playbooks or roles. Prefer modules that describe desired state so repeated runs converge. For command tasks, define when to run and how to report changes and failure. Handlers can reload a service after a task reports a change.\n\nVerify on representative nodes first. Use serial for batch size and explicitly drain, update, check health, and abort on failure. Check and diff preview modules that support them. Verify actual changes and handling of sensitive data.",
      ["Serial batching controls scope. Service health checks and abort conditions still need explicit tasks or policy.", "Verify targets against inventory and variable scope. Use appropriate secret storage and prevent exposure through logs or diffs."],
      ["Restarting services on every run, including runs with no change.", "Assuming --check predicts all tasks and their downstream dependencies."],
      [
        ["How do you avoid duplicate side effects when using command for a script?", "Prefer a module with desired-state semantics. For a script, use verifiable preconditions or creates/removes, define changed_when and failed_when, and make it safe to rerun."],
        ["When does a handler run?", "A task reports changed and sends notify. The handler runs at the defined phase and normally coalesces duplicate notifications in that batch. Use flush_handlers in sequence if it must run earlier."],
        ["How do serial and forks differ?", "serial limits the hosts in each play batch. forks limits Ansible's parallel worker processes. Rolling changes still require health checks and failure policy."],
        ["What do check and diff guarantee?", "They preview tasks that support those modes. Tasks depending on actual earlier results may not simulate accurately. Disable diff on tasks that could reveal secrets."],
        ["How do you verify convergence?", "Check files, processes, and service health on target hosts, then rerun with the same inputs and confirm there are no unexpected changes. Correlate with real service metrics."],
      ],
    ),
  },
  "cloud-network": {
    sources: ["aws-vpc-security", "aws-vpc-nat", "aws-vpc-routing", "aws-iam-roles"],
    zh: card(
      "云网络、负载均衡与 IAM",
      "以 AWS VPC 为例，从路由、网络过滤和服务身份三层解释可达性。",
      "以公网负载均衡转发到私有子网服务为例，跟踪入口、出网和权限故障。",
      "在 AWS VPC，子网路由表决定下一跳，Security Group 在关联的资源或接口层按状态过滤，网络 ACL 在子网边界无状态过滤。公网入口可以由负载均衡器转发到私有目标。私有子网主动访问互联网可通过相应路由和公网 NAT Gateway。\n\n网络可达之后还要检查服务身份与授权。工作负载通过 IAM role 获得临时凭证，再按实际策略、资源和请求上下文评估授权。排障时区分连接失败、应用错误与云 API 拒绝。",
      ["无状态网络 ACL 需要按请求和返回方向考虑规则与临时端口。", "分别验证客户端到负载均衡器、负载均衡器到目标、以及应用访问云 API 的路径。"],
      ["公网访问失败时直接开放应用实例到所有来源，跳过负载均衡和目标健康检查。", "把成功建立 TCP 连接视为 IAM 授权已经成功。"],
      [
        ["Security Group 与网络 ACL 有什么区别？", "Security Group 是有状态的，允许连接的返回流量会自动放行。网络 ACL 在子网层按有序规则无状态评估，双向都要允许。"],
        ["私有子网的实例如何访问互联网？", "一种常见路径是私有子网默认路由指向公网 NAT Gateway，后者所在子网有到互联网网关的路由。只访问支持的云服务时也可评估 VPC endpoint。"],
        ["公网负载均衡为什么能转发给私有实例？", "负载均衡器提供公网入口，再用 VPC 内的可达路径连接私有目标。检查目标组、监听规则、健康检查和目标侧网络过滤。"],
        ["IAM role 能解决连接超时吗？", "IAM role 提供身份和权限，连接超时先查 DNS、路由、过滤和目标监听。连接成功后若返回授权错误，再检查角色及策略。"],
        ["怎样诊断只在一个可用区发生的出网故障？", "按可用区比较子网路由、NAT 路径、网络 ACL、可达性和依赖健康。用流日志及请求时间线验证受影响范围。"],
      ],
    ),
    en: card(
      "Cloud networking, load balancing, and IAM",
      "Use AWS VPC to explain reachability through routes, network filtering, and service identity.",
      "Trace ingress, egress, and authorization failures for a public load balancer with private targets.",
      "In AWS VPC, a subnet route table determines the next hop. Security groups filter statefully at associated resources or interfaces, while network ACLs filter statelessly at the subnet boundary. A public load balancer can forward to private targets. Private subnets can initiate internet access through appropriate routes and a public NAT gateway.\n\nAfter checking reachability, verify service identity and authorization. Workloads use IAM roles for temporary credentials. Authorization depends on the actual policies, resource, and request context. Separate connection failures, application errors, and cloud API denials during diagnosis.",
      ["Stateless network ACLs need rules for both request and return paths, including ephemeral ports.", "Verify client-to-balancer, balancer-to-target, and application-to-cloud-API paths separately."],
      ["Opening an application instance to all sources when public access fails, before checking the load balancer or target health.", "Treating successful TCP establishment as proof of IAM authorization."],
      [
        ["How do security groups and network ACLs differ?", "A security group is stateful and allows return traffic for an allowed connection automatically. A network ACL evaluates ordered stateless rules at the subnet and must allow both directions."],
        ["How can an instance in a private subnet reach the internet?", "One common path is a private-subnet default route to a public NAT gateway whose subnet has a route to an internet gateway. Consider VPC endpoints when only supported cloud services are needed."],
        ["How can a public load balancer forward to a private instance?", "It supplies a public entry point and uses a reachable VPC path to the private target. Check target groups, listener rules, health checks, and target-side network filtering."],
        ["Can an IAM role fix a connect timeout?", "An IAM role supplies identity and permissions. For a connect timeout, check DNS, routes, filtering, and the listener. Inspect roles and policies if a reachable service returns an authorization error."],
        ["How do you diagnose egress failure in one availability zone?", "Compare subnet routes, NAT paths, network ACLs, reachability, and dependency health by zone. Use flow logs and request timelines to verify the affected scope."],
      ],
    ),
  },
});
