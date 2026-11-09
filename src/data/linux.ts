import { card } from "../i18n/contentTypes";
import { bilingualGroup } from "./bilingualGroup";

export const linux = bilingualGroup("linux", "Linux", "linux-performance", {
  "linux-performance": {
    sources: ["linux-load", "linux-psi", "linux-cgroup", "linux-df", "linux-unlink"],
    zh: card(
      "Linux 性能排障与资源限制",
      "从负载、CPU、内存、磁盘和容器配额拆解延迟，定位实际资源约束。",
      "以服务变慢且容器曾被 OOM 终止为例，关联应用时间线与主机、cgroup 数据。",
      "先确认受影响范围和变更时间。Linux load average 包含可运行任务与不可中断等待的任务，负载高时要区分 CPU 争用和阻塞。按时间窗口查看线程、磁盘延迟和 CPU、内存、I/O 的 PSI，并比对容器与宿主机的观测。\n\n对内存检查 cgroup v2 的 memory.current、memory.max 和 memory.events 等数据。磁盘则同时查容量、inode、I/O 延迟以及被删除但仍打开的文件。调优前先定位触发点并用同样负载验证。",
      ["默认情况下，memory.events 汇总本组及子组事件，memory.events.local 只统计本组。oom_kill 表明有组内进程被 OOM killer 终止，不能单独定位触发范围。", "PSI 衡量因资源争用造成的停顿时间，可用来区分资源使用和实际等待。"],
      ["看到 load average 高于 CPU 核数就判定 CPU 饱和。", "文件已删除但磁盘未释放时重复清理目录，忽略仍打开的文件描述符。"],
      [
        ["高负载、低 CPU 使用率可能是什么原因？", "不可中断等待也计入负载，例如部分存储 I/O。查看线程状态、I/O 延迟和 PSI，结合进程及设备定位。"],
        ["宿主机还有内存，容器为何可能被 OOM 终止？", "容器 cgroup 可能触及自身或祖先内存上限。沿层级核对 memory.max 和 memory.events.local 的 oom 增量，再结合容器退出状态及内核日志，区分 cgroup 内 OOM 与主机级 OOM。"],
        ["看 free 还是 available？", "估计还能在不交换的情况下使用的内存时看 available，该估计考虑了可回收缓存。进程 RSS、主机 available 和 cgroup 用量分别回答不同问题。"],
        ["磁盘有容量却无法创建文件，先查什么？", "同时检查 df -h、df -i 和应用错误，区分块、inode、配额与权限。空间用量不一致时检查挂载边界和已删除但仍打开的文件。"],
        ["如何验证延迟由存储引起？", "关联应用尾延迟、设备完成延迟和队列、I/O PSI 以及等待进程，再做受控复现。高吞吐或单个利用率值不足以定位。"],
      ],
    ),
    en: card(
      "Linux performance diagnosis and resource limits",
      "Separate load, CPU, memory, storage, and container quotas to locate the resource constraining latency.",
      "Use a slow service with a recent container OOM to correlate application, host, and cgroup timelines.",
      "Establish the impact and change timeline. Linux load average counts runnable tasks and tasks in uninterruptible sleep, so high load calls for distinguishing CPU contention from blocking. Check thread states, disk latency, and CPU, memory, and I/O PSI over the same window. Compare host and container observations.\n\nFor memory, inspect cgroup v2 metrics such as memory.current, memory.max, and memory.events. For disks, check bytes, inodes, I/O latency, and deleted files that are still open. Locate the trigger and verify changes with the same workload.",
      ["By default, memory.events includes events from the cgroup and its descendants; memory.events.local reports only local events. oom_kill records kills of processes in the cgroup by an OOM killer and does not identify where OOM was triggered.", "PSI measures stalled time due to resource contention and helps separate utilization from waiting."],
      ["Treating load average above the CPU count as proof of CPU saturation.", "Cleaning the directory repeatedly while ignoring open descriptors for deleted files."],
      [
        ["What can produce high load with low CPU utilization?", "Uninterruptible waits count toward load, including some storage I/O waits. Inspect thread states, I/O latency, and PSI, then correlate with the affected process and device."],
        ["Why can a container be OOM-killed while the host has free memory?", "The container cgroup can hit its own or an ancestor's memory limit. Check memory.max and increases in oom in memory.events.local along the hierarchy. Correlate container exit status and kernel logs to distinguish cgroup OOM from host OOM."],
        ["Should you look at free or available memory?", "Use available to estimate what can be allocated without swapping. It accounts for reclaimable cache. Process RSS, host available memory, and cgroup usage answer different questions."],
        ["What do you check if file creation fails despite free disk space?", "Check df -h, df -i, and the application error to separate blocks, inodes, quotas, and permissions. If usage differs between views, inspect mount boundaries and deleted files that are still open."],
        ["How do you verify that storage drives latency?", "Correlate application tail latency with device completion times, queues, I/O PSI, and waiting processes, then reproduce under controlled load. Throughput or a single utilization figure is insufficient."],
      ],
    ),
  },
  "linux-services": {
    sources: ["linux-signal", "linux-fork", "linux-wait", "linux-path", "systemd-service", "systemd-unit", "systemctl", "systemd-journal"],
    zh: card(
      "进程、权限与 systemd",
      "掌握信号、文件描述符和服务生命周期，按 unit、日志与运行上下文排查启动故障。",
      "以发布后服务反复重启为例，检查退出状态、权限、环境变量和资源上限。",
      "进程的文件描述符可指向文件、socket 或管道。检查运行用户、目录搜索权限、文件权限以及描述符上限。用 SIGTERM 请求服务按约定退出。SIGKILL 不能被捕获或忽略，进程没有执行清理代码的机会。\n\n在 systemd 下用 systemctl status 看 unit 状态，用 journalctl -u 查时间线。核对 ExecStart、User、WorkingDirectory、环境、Restart 和启动限频。在一致的运行上下文复现后再修配置，并验证启动、停止和服务健康。",
      ["systemd 的服务状态与应用就绪不同，需验证实际监听和健康检查。", "父进程应回收已退出的子进程。僵尸进程保留退出信息，等待回收。"],
      ["交互式 shell 能启动便假定 systemd 使用相同的 PATH、环境和工作目录。", "发现进程没退出立即使用 SIGKILL，跳过排空和故障取证。"],
      [
        ["SIGTERM 和 SIGKILL 有什么区别？", "应用可以处理 SIGTERM 来排空或清理。SIGKILL 无法捕获、屏蔽或忽略，用于正常停止路径无法完成时。"],
        ["僵尸进程和孤儿进程有什么区别？", "僵尸已经退出，等待父进程读取退出状态。孤儿的原父进程先退出，子进程会被重新托管，可能仍在运行。"],
        ["如何排查 Too many open files？", "查看进程描述符数量和类型，核对 /proc/<pid>/limits 及服务的 LimitNOFILE。先找连接或文件泄漏，再评估是否调整容量。"],
        ["服务用户能读文件但仍报 Permission denied，查什么？", "检查路径上各级目录的搜索权限、真实运行身份和组，再查 ACL、挂载限制或 SELinux/AppArmor 日志。"],
        ["服务因反复失败触发启动限频，怎样恢复？", "先根据 journal 和退出码修复根因。若修改了 unit，执行 systemctl daemon-reload。需要立即恢复时，用 systemctl reset-failed <unit> 清除失败状态和启动限频计数，再启动并验证服务健康。"],
      ],
    ),
    en: card(
      "Processes, permissions, and systemd",
      "Understand signals, descriptors, and service lifetime, then diagnose startup using unit state, logs, and execution context.",
      "Use a restart loop after deployment to inspect exit status, permissions, environment, and resource limits.",
      "A process's file descriptors can point to files, sockets, or pipes. Check its user, directory search permission, file permissions, and descriptor limits. Use SIGTERM to request shutdown according to the service contract. SIGKILL cannot be caught or ignored, leaving no opportunity for cleanup code.\n\nUse systemctl status for unit state and journalctl -u for the timeline. Inspect ExecStart, User, WorkingDirectory, environment, Restart, and start rate limits. Reproduce in the same execution context, correct the cause, and verify start, stop, and application health.",
      ["systemd service state and application readiness are different. Verify the actual listener and health checks.", "A parent should reap exited children. A zombie retains exit information until it is reaped."],
      ["Assuming a service has the same PATH, environment, and working directory as an interactive shell.", "Using SIGKILL immediately and skipping drain and evidence collection."],
      [
        ["How do SIGTERM and SIGKILL differ?", "An application can handle SIGTERM to drain or clean up. SIGKILL cannot be caught, blocked, or ignored. Use it when normal shutdown cannot complete."],
        ["How do zombie and orphan processes differ?", "A zombie has exited and awaits collection of its status. An orphan's original parent exited first, so the child is reparented and may still be running."],
        ["How do you diagnose Too many open files?", "Inspect descriptor counts and types, /proc/<pid>/limits, and the service's LimitNOFILE. Look for connection or file leaks before changing capacity."],
        ["What if the service user can read the file but gets Permission denied?", "Check search permission along the path, effective identity and groups, then ACLs, mount restrictions, or SELinux/AppArmor logs."],
        ["How do you recover a service that hit the start rate limit?", "Fix the cause using the journal and exit code. Run systemctl daemon-reload if the unit changed. To recover immediately, use systemctl reset-failed <unit> to clear the failed state and start rate counter, then start the service and verify health."],
      ],
    ),
  },
});
