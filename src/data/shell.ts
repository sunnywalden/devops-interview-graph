import { card } from "../i18n/contentTypes";
import { bilingualGroup } from "./bilingualGroup";

export const shell = bilingualGroup("shell", "Shell", "expansion", {
  expansion: {
    sources: ["posix-shell", "bash-manual"],
    zh: card(
      "Shell 展开与参数边界",
      "用引号保留参数边界，用位置参数或数组传递参数列表，避免把输入重新解析成代码。",
      "用包含空格、通配符和前导连字符的文件名验证发布脚本。",
      "Shell 先识别语法结构，再按上下文执行参数展开、命令替换等步骤。未加引号的参数展开通常还会经历字段分割和路径名展开；双引号能抑制这两步，同时保留变量展开。\n\n转发参数时使用 \"$@\"，它保留每个参数的边界和空参数。构造命令时，POSIX Shell 可用 set -- 构造参数列表，Bash 可用数组。处理以连字符开头的文件名时，还需要在命令支持的情况下使用 --，或提供带路径前缀的文件名。",
      ["单引号保留字面内容；双引号内仍可展开变量和执行命令替换。", "命令替换会去掉输出末尾的换行；引号无法恢复这些换行。"],
      ["把命令拼成字符串再交给 eval 会触发重新解析，导致引号错误或命令注入。", "未加引号的变量展开可能把一个路径拆成多个参数，或者把变量内容解释为通配符。"],
      [
        ["如何原样转发脚本参数？", "使用 \"$@\"。每个位置参数独立展开为一个词，包括空参数。\"$*\" 则会拼接成一个词，分隔符取 IFS 的首字符。IFS 未设置时用空格，设为空时不加分隔符。"],
        ["变量加了双引号，为什么文件名仍可能被当成选项？", "双引号控制 Shell 的词边界，选项由被调用的程序解析。对支持 -- 的命令可用 rm -- \"$file\"；对相对文件名也可加 ./ 前缀。"],
        ["为什么不应解析 ls 的输出来遍历文件？", "展示格式可能受区域设置、终端和文件名内容影响，换行也可能出现在文件名中。可用 find 的 -exec 直接传参，或用正确处理无匹配情况的 glob 并对每个路径加引号。"],
        ["如何保留动态构造的选项和值？", "用 Bash 数组保存参数，再用 \"${args[@]}\" 展开；面向 /bin/sh 时可用 set -- \"$@\" --output \"$path\" 追加位置参数。"],
        ["双引号能让 eval 安全处理外部输入吗？", "不能。eval 会把收到的文本再次交给 Shell 解析，输入可能形成新语法。应调用固定命令并独立传参，同时按目标程序的规则校验输入。"],
      ],
    ),
    en: card(
      "Shell expansion and argument boundaries",
      "Quote expansions to preserve argument boundaries, and use positional parameters or arrays to pass argument lists without reparsing input as code.",
      "Validate a release script with filenames containing spaces, glob characters, and leading hyphens.",
      "The shell recognizes syntax before carrying out expansions such as parameter expansion and command substitution. Unquoted parameter expansions normally undergo field splitting and pathname expansion as well. Double quotes suppress those two steps while allowing parameter expansion.\n\nUse \"$@\" when forwarding arguments to preserve their boundaries, including empty arguments. To build an argument list, use set -- in a POSIX shell or an array in Bash. For filenames starting with a hyphen, pass -- when the utility supports it, or use a pathname prefix.",
      ["Single quotes preserve literal content. Double quotes still allow parameter expansion and command substitution.", "Command substitution removes trailing newlines. Quoting cannot restore them."],
      ["Building a command string and passing it to eval reparses it, which can cause quoting errors or command injection.", "An unquoted variable can split one pathname into several arguments or interpret its content as a glob pattern."],
      [
        ["How do you forward script arguments unchanged?", "Use \"$@\". Each positional parameter expands to a separate word, including empty arguments. \"$*\" joins them into one word with the first character of IFS, a space if IFS is unset, or no separator if IFS is empty."],
        ["Why can a double-quoted filename still be interpreted as an option?", "Quoting controls the shell's word boundaries. The invoked program parses options. Use rm -- \"$file\" when the utility supports --, or add a ./ prefix to a relative filename."],
        ["Why avoid parsing ls output to iterate over files?", "Its display format can depend on locale, terminal, and filename content, and filenames can contain newlines. Use find with -exec to pass arguments directly, or use a glob with explicit no-match handling and quote each pathname."],
        ["How do you preserve dynamically built options and values?", "Store arguments in a Bash array and expand it with \"${args[@]}\". When targeting /bin/sh, append to the positional parameters with set -- \"$@\" --output \"$path\"."],
        ["Does double-quoting make eval safe for external input?", "No. eval asks the shell to parse the resulting text again, so input can introduce new syntax. Invoke a fixed command with separate arguments, and validate them according to the receiving program's rules."],
      ],
    ),
  },
  "exit-status": {
    sources: ["posix-shell", "bash-manual", "posix-grep"],
    zh: card(
      "退出状态与管道错误处理",
      "显式判断关键命令的退出状态，区分预期的业务结果和需要中止的执行故障。",
      "用构建输出写入日志的流水线演练构建失败、无匹配和日志写入失败。",
      "默认情况下，管道的退出状态取自最后一个命令，因此 build | tee build.log 可能掩盖 build 的失败。Bash 的 pipefail 会返回最右侧非零命令的状态，全部成功时返回零。需要定位具体阶段时，应在管道后立即读取 Bash 的 PIPESTATUS。\n\nset -e 在 if 的条件、部分 && 或 || 列表等上下文存在例外。用 if 或 case 明确处理需要区分的状态，例如 grep 返回 1 表示无匹配，大于 1 表示错误。",
      ["重定向按从左到右处理；>log 2>&1 与 2>&1 >log 的结果可能不同。", "面向既有 /bin/sh 环境时，先核实 pipefail 支持情况；PIPESTATUS 是 Bash 接口。"],
      ["只检查 tee 的退出状态，可能把失败构建当作成功。", "命令执行后先打印日志，再读取 $? 或 PIPESTATUS，会丢失原来的状态。"],
      [
        ["如何同时保留构建输出与失败状态？", "在 Bash 启用 pipefail，把 build | tee build.log 放在 if 的条件里，可让日志保留且任一阶段失败时进入错误分支。若需要区分哪一段失败，在所进分支的第一条命令中用 statuses=(\"${PIPESTATUS[@]}\") 保存每段状态，后续执行其他命令会覆盖它。"],
        ["grep 返回 1 时应该失败吗？", "按业务语义决定。0 表示有匹配，1 表示无匹配，大于 1 表示执行错误。无匹配如果是预期分支，应显式处理。"],
        ["set -e 为什么没让 if 条件中的失败退出？", "条件位置会消费退出状态，用于选择控制流；Bash 对这些位置有明确的 errexit 例外。用显式检查传递关键错误。"],
        ["cmd >log 2>&1 如何处理 stderr？", "先把 stdout 指向 log，再把 stderr 复制到当前 stdout。反过来写会先复制原来的 stdout，随后只把 stdout 改到文件。"],
        ["pipefail 为什么可能让提前结束的管道报错？", "例如 head 读够后会关闭读端，上游继续写入可能收到 SIGPIPE。应根据命令协议区分预期的提前终止和实际故障，并避免统一忽略非零状态。"],
      ],
    ),
    en: card(
      "Exit status and pipeline failures",
      "Check critical command statuses explicitly and distinguish expected business outcomes from execution failures that should stop the script.",
      "Exercise a build-and-log pipeline with a failed build, an empty match, and a log write failure.",
      "By default, a pipeline takes its exit status from the last command, so build | tee build.log can hide a failed build. Bash pipefail uses the status of the rightmost command that failed, or zero if all commands succeeded. To identify the failing stage, capture Bash's PIPESTATUS immediately after the pipeline.\n\nThe behavior of set -e has exceptions, including if conditions and parts of && or || lists. Use if or case to handle meaningful statuses explicitly. For example, grep status 1 means no match, and a status greater than 1 indicates an error.",
      ["Redirections apply from left to right. >log 2>&1 and 2>&1 >log can produce different results.", "Check pipefail support when targeting a deployed /bin/sh. PIPESTATUS is a Bash interface."],
      ["Checking only tee's exit status can let a failed build appear successful.", "Logging before reading $? or PIPESTATUS replaces the original status information."],
      [
        ["How can you retain build output and detect failure?", "In Bash, enable pipefail and put build | tee build.log in an if condition. The log is preserved and failure at either stage takes the error branch. To identify the failing stage, save the per-command statuses with statuses=(\"${PIPESTATUS[@]}\") as the first command in the branch you enter. Running another command overwrites PIPESTATUS."],
        ["Should grep returning 1 fail the script?", "It depends on what the script is doing. Zero means a match, 1 means no match, and a status greater than 1 indicates an execution error. Handle no match explicitly when it is an expected outcome."],
        ["Why did set -e fail to exit on a failing if condition?", "A condition consumes the exit status to select control flow. Bash defines errexit exceptions for such positions. Propagate critical errors through explicit checks."],
        ["What happens to stderr in cmd >log 2>&1?", "The shell redirects stdout to log, then duplicates the current stdout descriptor onto stderr. Reversing the order duplicates the original stdout first, then redirects only stdout to the file."],
        ["Why can pipefail report an error on an intentionally shortened pipeline?", "For example, head closes its read end once it has enough data. The upstream process may receive SIGPIPE if it keeps writing. Use the commands' contracts to distinguish expected early termination from actual failures, and handle each case explicitly."],
      ],
    ),
  },
  automation: {
    sources: ["posix-shell", "bash-manual", "posix-rename", "bsd-mktemp"],
    zh: card(
      "可靠运维脚本与安全发布",
      "把输入校验、准备、验证、提交和清理分开，并设计可重复执行的发布步骤。",
      "以配置文件更新为例，演练输入无效、并发执行以及发布后健康检查失败。",
      "先校验参数、权限和目标目录，再在目标目录安全创建临时文件，生成并验证候选配置。适用时用同一文件系统内的 rename 原子替换单个路径，使并发读者看到旧版或新版。发布后用服务配置检查或健康检查确认生效。\n\n用 EXIT trap 清理本次创建的临时资源。重试前读取目标状态，使用版本或摘要识别已完成的步骤。并发写入时用锁或条件更新协调，避免一个执行覆盖另一个执行的结果。",
      ["原子替换只覆盖单个路径的可见性；断电持久性、多文件一致性和服务重载需要各自的保证。", "将候选文件放在目标目录，检查替换后所需的权限和属主，再执行提交。"],
      ["固定临时文件名或先检查再创建，会产生竞态。", "清理范围过宽、忽略空变量或覆盖原始退出状态，会增加故障和排障成本。"],
      [
        ["为什么先写临时文件再替换？", "生成或校验失败时保留当前版本；在同一文件系统满足 rename 语义时，读者不会通过目标路径看到写到一半的内容。跨文件系统的复制删除不具有该保证。"],
        ["如何设计可重试的配置更新？", "先比较目标版本或摘要，已达到期望状态时跳过写入，再确认服务实际采用的版本。若上次在写入与重载之间退出，重试应能继续重载或按策略回退。"],
        ["EXIT trap 能否保证任何退出都清理？", "不能。SIGKILL 无法捕获，掉电也不会执行 trap。只清理本次创建的资源，保留失败状态，并用受控的定期清理处理残留。"],
        ["两次执行都通过预检查时，如何避免覆盖？", "让写入方在共享锁内重新读取当前状态并提交，或由目标系统执行带版本条件的更新。原子 rename 不能替代并发写入协调。"],
        ["怎样验证 dry-run 和真实发布？", "dry-run 走同一套参数检查、候选配置生成和校验，只展示目标版本或差异，不替换配置、不重载服务。真实发布在校验后提交，核对服务实际加载的版本并做健康检查。可模拟重载失败验证旧版本恢复，也可在成功后重跑确认不会重复提交。"],
      ],
    ),
    en: card(
      "Reliable operations scripts and safe releases",
      "Separate input validation, preparation, verification, commit, and cleanup, and make release steps safe to repeat.",
      "Use a configuration update to exercise invalid input, concurrent execution, and a failed post-deployment health check.",
      "Validate arguments, permissions, and the destination first. Securely create a temporary file in the destination directory, generate the candidate configuration, and verify it. Where applicable, rename within one filesystem to atomically replace a single path so readers see either the old or the new version. Confirm activation with a service configuration check or a health check.\n\nUse an EXIT trap to clean up temporary resources from this run. Before retrying, inspect the target and use its version or digest to identify completed steps. Coordinate concurrent writers through a lock or a conditional update to avoid overwriting another run's work.",
      ["Atomic replacement covers visibility at one path. Crash durability, multi-file consistency, and service reload each require separate guarantees.", "Put the candidate in the destination directory and verify the ownership and permissions required after replacement before committing it."],
      ["A predictable temporary filename or a check-then-create sequence introduces races.", "Broad cleanup, unchecked empty variables, and losing the original exit status make failures more likely or harder to diagnose."],
      [
        ["Why write a temporary file before replacing the destination?", "Generation or validation failures leave the current version available. With same-filesystem rename semantics, readers of the destination path cannot see a partially written file. Copying and removing across filesystems provides no such guarantee."],
        ["How do you make a configuration update retryable?", "Compare the target version or digest first, skip the write if it already matches, then check the version actually used by the service. A retry after a failure between writing and reloading should be able to resume the reload or roll back according to policy."],
        ["Does an EXIT trap guarantee cleanup after every termination?", "No. A process cannot catch SIGKILL, and a power loss cannot run a trap. Clean up only resources created by the current run, preserve the failure status, and use controlled periodic cleanup for leftovers."],
        ["How do you prevent overwrites when two runs pass preflight?", "Have writers re-read current state and commit under a shared lock, or use a version-conditional update in the target system. Atomic rename alone does not coordinate writers."],
        ["How do you validate dry runs and live releases?", "A dry run uses the same input checks, candidate generation, and validation. It shows the target version or diff without replacing configuration or reloading services. A real release commits after validation, checks the version the service actually loaded, and verifies health. Simulate a reload failure to verify restoration of the previous version, and rerun a successful release to confirm it does not commit again."],
      ],
    ),
  },
});
