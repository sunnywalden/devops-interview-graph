import { card } from "../i18n/contentTypes";
import { bilingualGroup, bilingualTopics } from "./bilingualGroup";

export const postgres = bilingualGroup("postgres", "PostgreSQL", "pg-mvcc", {
  "pg-mvcc": {
    sources: ["pg-mvcc", "pg-isolation", "pg-vacuum", "pg-wal"],
    zh: card(
      "PostgreSQL MVCC、VACUUM 与 WAL",
      "用元组版本解释快照与清理，再区分事务可见性和崩溃恢复。",
      "以更新频繁且有长事务的表为例，检查死元组、自动清理和事务寿命。",
      "PostgreSQL 的 MVCC 通过行版本实现快照可见性。默认 Read Committed 下，每条普通 SELECT 取得语句开始时的快照。Repeatable Read 下，事务使用首次非事务控制语句建立的快照，并可能因并发更新失败。Serializable 还会检测无法串行化的执行，应用要准备重试整个事务。\n\n更新和删除产生后续可清理的旧版本。VACUUM 在安全时回收空间供表内复用，并处理事务 ID 冻结。WAL 在相关数据页写回前记录变更，为崩溃重放和物理复制等提供基础。",
      ["长事务或其他保留旧快照的机制可能推迟版本清理。先查快照寿命，再调 autovacuum。", "普通 VACUUM 通常使空间可供表复用。VACUUM FULL 会重写表并获取更强的锁。"],
      ["认为更新会覆盖唯一行版本，忽略清理压力。", "将 WAL 当成读事务为查询构造快照时直接读取的历史版本库。"],
      [
        ["同一事务内两条 SELECT 为什么可能读到不同数据？", "默认 Read Committed 为每条语句建立快照。其他事务在两条语句之间提交时，后者可能读到新值。"],
        ["Repeatable Read 与 Serializable 有何区别？", "PostgreSQL 的 Repeatable Read 提供快照隔离，仍可能出现序列化异常。Serializable 会检测可能导致序列化异常的依赖并在必要时中止事务。这两种级别遇到 SQLSTATE 40001 时，都应从事务起点重新读取并执行，重试要有预算。"],
        ["普通 VACUUM 为什么不一定让磁盘文件变小？", "它通常回收表内空间供后续写入。能否截断尾部取决于空闲页位置等条件。需要整体压缩时，评估 VACUUM FULL 的重写、锁和额外空间。"],
        ["怎么查 autovacuum 落后？", "结合 pg_stat_user_tables 中的估算死元组和最近清理时间、长事务、清理进度与写入速率，找出受限点。"],
        ["WAL 与 MVCC 的职责各是什么？", "WAL 记录恢复所需的变更并支持重放。MVCC 按快照决定各个行版本对事务是否可见。"],
      ],
    ),
    en: card(
      "PostgreSQL MVCC, VACUUM, and WAL",
      "Use tuple versions to explain snapshots and cleanup, then distinguish transaction visibility from crash recovery.",
      "Use an update-heavy table with a long transaction to examine dead tuples, autovacuum, and transaction age.",
      "PostgreSQL MVCC uses row versions for snapshot visibility. Under the default Read Committed level, each ordinary SELECT sees a snapshot from the start of its statement. Under Repeatable Read, a transaction uses the snapshot established by its first non-transaction-control statement and can fail on a concurrent update. Serializable also detects nonserializable executions, and the application must be ready to retry the entire transaction.\n\nUpdates and deletes leave old versions that can later be cleaned up. VACUUM reclaims reusable table space when safe and handles transaction ID freezing. WAL records changes before the corresponding data pages are written, supporting crash replay and physical replication.",
      ["Long transactions or other holders of old snapshots can delay version cleanup. Check snapshot age before tuning autovacuum.", "Plain VACUUM normally makes space reusable within the table. VACUUM FULL rewrites the table and takes a stronger lock."],
      ["Assuming an update overwrites the only version of a row and ignoring cleanup pressure.", "Treating WAL as a store that reads consult directly for historical versions when building a snapshot."],
      [
        ["Why can two SELECT statements in one transaction see different data?", "The default Read Committed level gives each statement its own snapshot. If another transaction commits between them, the later statement can see the new value."],
        ["How do Repeatable Read and Serializable differ?", "PostgreSQL Repeatable Read provides snapshot isolation, where serialization anomalies can still occur. Serializable detects dependencies that could lead to serialization anomalies and aborts a transaction when needed. On SQLSTATE 40001 at either level, retry the entire transaction, including its reads, within a retry budget."],
        ["Why may plain VACUUM leave the file size unchanged?", "It usually reclaims space inside the table for later writes. Truncating the tail depends on where free pages are and other conditions. For compaction, evaluate VACUUM FULL's rewrite, lock, and extra space."],
        ["How do you investigate lagging autovacuum?", "Correlate estimated dead tuples and recent vacuum times in pg_stat_user_tables with old transactions, vacuum progress, and write rate to identify the constraint."],
        ["What are the respective roles of WAL and MVCC?", "WAL records changes for recovery and supports replay. MVCC uses a snapshot to decide which row versions a transaction can see."],
      ],
    ),
  },
  "pg-query-plan": {
    sources: ["pg-explain", "pg-index-only", "pg-index-types", "pg-index-partial"],
    zh: card(
      "PostgreSQL 查询计划与索引选择",
      "从估计行数、执行循环和缓冲读写定位查询瓶颈，再选择合适索引。",
      "用按租户分页和 JSONB 查询比较不同索引策略、扫描范围与写入代价。",
      "先用 EXPLAIN 查看计划。对代表性参数，在受控环境用 EXPLAIN (ANALYZE, BUFFERS) 看实际行数、循环次数和缓冲区访问，定位估计偏差、重复扫描和 I/O。节点执行多次时，actual time 和 rows 是每次循环的平均值；上层节点的 BUFFERS 统计包含子节点。ANALYZE 会执行语句，写语句尤其要控制副作用。\n\n常见等值、范围与有序读取可考虑 B-tree。对受支持的 JSONB 查询可考虑 GIN，并核对操作符类。仅索引扫描（Index Only Scan）还受可见性映射影响。索引收益要结合真实数据分布、延迟和写入成本验证。",
      ["估计行数明显偏离实际时检查统计信息、数据倾斜和列相关性。", "部分索引依赖优化器能证明查询谓词蕴含索引谓词，需验证真实参数与计划。"],
      ["看到顺序扫描便认为查询一定有问题。", "看到 Index Only Scan 就断定没有访问表，忽略 Heap Fetches。"],
      [
        ["为什么表有索引仍选择顺序扫描？", "如果匹配大部分行或表很小，顺序访问可能更便宜。也要检查统计信息、谓词和操作符是否能利用索引。"],
        ["EXPLAIN ANALYZE 可以安全用于 UPDATE 吗？", "它会真正执行 UPDATE。要在受控环境验证。若用事务回滚，也要考虑锁、负载和回滚不了的外部副作用。"],
        ["索引包含了所有字段，为什么还要访问表？", "索引不保存 MVCC 可见性信息。如果堆页没有被可见性映射标记为 all-visible，就要访问堆来确认可见性。"],
        ["什么查询适合给 JSONB 建 GIN 索引？", "取决于查询操作符和 GIN 操作符类，例如受支持的包含查询。用实际谓词与数据测试，也要比较写放大与索引大小。"],
        ["如何替换大 OFFSET 的深分页？", "使用稳定排序及唯一的最终排序键，记录上一页边界，用匹配索引按键集继续。并定义并发数据变动时允许的分页语义。"],
      ],
    ),
    en: card(
      "PostgreSQL query plans and index selection",
      "Use estimated rows, execution loops, and buffer activity to find query bottlenecks and choose indexes.",
      "Use tenant-scoped pagination and JSONB queries to compare index strategies, scan ranges, and write costs.",
      "Start with EXPLAIN. For representative parameters in a controlled environment, use EXPLAIN (ANALYZE, BUFFERS) to inspect actual rows, loops, and buffer activity. Look for estimate errors, repeated scans, and I/O. For a node executed multiple times, actual time and rows are per-loop averages; a parent node's BUFFERS counts include its children. ANALYZE runs the statement, so control side effects, especially for writes.\n\nConsider B-tree for common equality, range, and ordered access. GIN can suit supported JSONB queries, depending on the operator class. Index-only scans also depend on the visibility map. Validate indexes against real distributions, latency, and write costs.",
      ["When estimated and actual rows differ substantially, check statistics, skew, and column correlation.", "A partial index requires the planner to prove that the query predicate implies the index predicate. Check real parameters and plans."],
      ["Assuming a sequential scan always indicates a problem.", "Assuming Index Only Scan means zero table access and overlooking Heap Fetches."],
      [
        ["Why choose a sequential scan when an index exists?", "Sequential access can be cheaper for a small table or when most rows qualify. Check statistics and whether the predicates and operators can use the index."],
        ["Is EXPLAIN ANALYZE safe for UPDATE?", "It actually runs the UPDATE. Test in a controlled environment. Even if you roll back, consider locks, load, and external effects that cannot be rolled back."],
        ["Why visit the table when the index contains every needed column?", "The index lacks MVCC visibility information. If a heap page is not marked all-visible in the visibility map, the executor checks the heap for visibility."],
        ["What queries suit a GIN index on JSONB?", "That depends on the operator and GIN operator class, for example a supported containment predicate. Test the actual predicates and data and compare write amplification and index size."],
        ["How do you replace deep OFFSET pagination?", "Use stable ordering with a unique final sort key and remember the previous page boundary. Continue by keyset with a matching index and define the expected behavior under concurrent changes."],
      ],
    ),
  },
});

export const redisAtomicity = bilingualTopics("redis", {
  "redis-atomicity": {
    sources: ["redis-pipeline", "redis-transactions", "redis-scripts", "redis-cluster"],
    zh: card(
      "Redis 流水线、事务与 Lua",
      "分别解释网络往返、命令隔离执行和业务原子更新。",
      "用配额扣减和过期时间的更新场景，比较流水线、WATCH 与 Lua。",
      "流水线减少网络往返，通过批量发送命令并收取响应来提高吞吐。MULTI/EXEC 在 EXEC 时连续执行已入队命令，期间不会插入其他客户端的命令。WATCH 可在受监视键发生变化时让 EXEC 放弃执行。\n\nLua 脚本在服务端隔离执行，适合短小的读改写逻辑。事务或脚本执行中出现错误时，已经执行的写入可能保留。限制批次和脚本成本，并将集群的键槽和重试语义纳入设计。",
      ["WATCH 的状态绑定连接，需要在同一连接上完成读取、入队和 EXEC。", "客户端在提交附近断线时可能不知道是否已经执行，应按业务幂等设计重试。"],
      ["用流水线实现需要不可分割执行的读改写。", "在 Lua 中扫描大集合或执行长计算，阻塞其他命令。"],
      [
        ["pipeline 可以保证整批命令原子执行吗？", "流水线本身只减少往返，其他客户端命令可以穿插。需要隔离时使用事务或脚本，并考虑执行期错误。"],
        ["MULTI 后的命令什么时候真正执行？", "未发生入队错误且 WATCH 未中止事务时，EXEC 触发执行已排队的命令。入队错误（如参数数量错误）会让 EXEC 放弃整批。执行期某命令失败时，其余命令仍会处理，已完成的写入不会回滚。"],
        ["WATCH 冲突怎么处理？", "监视期间，客户端修改键，或 Redis 让键过期、将其淘汰，都会使 EXEC 放弃执行。每次重试在同一连接重新 WATCH、读取、计算和提交。限制重试次数，高冲突时可评估短脚本。"],
        ["Lua 脚本运行一半出错会回滚吗？", "Redis 隔离执行脚本，但已完成的写入不会因脚本报错而回滚。先验证输入和必要条件，缩小写入后的失败面。"],
        ["在 Redis Cluster 里操作多个键要注意什么？", "相关事务和脚本通常要求键位于同一哈希槽，可按业务边界使用 hash tag。还要避免过度集中负载形成热点。"],
      ],
    ),
    en: card(
      "Redis pipelines, transactions, and Lua",
      "Explain network round trips, isolated command execution, and atomic business updates separately.",
      "Compare pipelining, WATCH, and Lua for a quota decrement with expiration.",
      "Pipelining improves throughput by sending commands and collecting replies in batches, reducing network round trips. MULTI/EXEC executes queued commands consecutively at EXEC without interleaving other clients' commands. WATCH can make EXEC abort when a watched key changes.\n\nLua scripts execute in isolation on the server and suit short read-modify-write operations. An execution error in a transaction or script can leave completed writes in place. Bound batch and script costs and account for cluster slots and retry semantics.",
      ["WATCH state belongs to the connection. Use the same connection to read, queue, and EXEC.", "A disconnect near submission can leave execution outcome unknown. Design retries around business idempotency."],
      ["Using a pipeline for a read-modify-write that needs indivisible execution.", "Scanning a large collection or doing long computations in Lua and blocking other commands."],
      [
        ["Does pipelining make the batch atomic?", "Pipelining itself only saves round trips. Other clients' commands can interleave. Use a transaction or script for isolation and account for execution errors."],
        ["When do commands after MULTI actually run?", "EXEC runs the queued commands if there was no queue-time error or WATCH conflict. A queue-time error such as a wrong number of arguments makes EXEC discard the batch. If a command fails during execution, other commands still run and completed writes remain in place."],
        ["How do you handle a WATCH conflict?", "EXEC aborts if a client modifies a watched key or Redis expires or evicts it. On each retry, WATCH again, reread, recompute, and submit on the same connection. Bound retries and consider a short script under high contention."],
        ["Does Redis roll back if a Lua script errors midway?", "Redis executes the script in isolation, but writes already completed are not rolled back on error. Validate inputs and preconditions first to reduce failure paths after writing."],
        ["What matters when using multiple keys on Redis Cluster?", "Related transactions and scripts generally require keys in the same hash slot. Use hash tags where they match the business boundary and avoid concentrating traffic into a hotspot."],
      ],
    ),
  },
});

export const kafkaConsumers = bilingualTopics("mq", {
  "kafka-consumers": {
    sources: ["kafka-design", "kafka-consumer", "kafka-rebalance", "rabbitmq-confirms"],
    zh: card(
      "Kafka 消费组、位点与处理语义",
      "用分区分配、提交时机和重平衡解释顺序、并发和重复处理。",
      "以消费订单事件并写入数据库为例，说明位点进度与业务提交之间的故障窗口。",
      "在普通 Kafka consumer group 的稳定分配中，一个分区由组内一个成员消费，顺序只在分区内讨论。committed offset 记录恢复时的下一读取位置。先处理后提交可避免把未处理记录跳过，但进程可能在业务提交后、位点提交前退出，导致重复处理。\n\n分区分配变化时协调在途任务和位点，防止无序推进。Kafka 事务可以在配置正确时原子提交 Kafka 输出与消费位点，配合 read_committed 读取。写外部数据库仍需明确的幂等或事务协作。",
      ["消费位点应基于连续已完成的分区进度，避免跨过仍未完成的记录。", "分区数约束组内并行消费的上限。热点键可能让单个分区成为瓶颈。"],
      ["处理前提交位点，却期待进程崩溃后仍能重新处理。", "启用 Kafka 事务后，认为外部 HTTP 调用或数据库写入也自动精确一次。"],
      [
        ["提交 offset 记的是哪条记录？", "提交值通常表示下一条要读的记录位置。按分区记录连续完成进度，避免并行处理完成顺序不同时跳过未完成记录。"],
        ["重平衡会如何影响正在处理的消息？", "分区可能转移到另一成员。正常撤销时，在客户端允许的范围内排空在途工作，只提交连续处理完成位置之后的偏移量。如果已失去分区所有权（如 Java 客户端收到 onPartitionsLost），停止该分区的工作，不再提交它的偏移量；业务处理仍要容忍重复。"],
        ["同一个订单如何保持事件顺序？", "按稳定的订单键分区，并在同一分区对该键保持处理顺序。分区数变动和消费者内并行可能影响既有的顺序假设。"],
        ["Kafka 的精确一次语义能覆盖外部数据库吗？", "Kafka 事务能将 Kafka 输出和位点放入同一事务，且下游需按已提交读取。外部数据库需自己的原子去重、幂等写入或其他协调方案。"],
        ["Kafka 位点提交和 RabbitMQ 确认怎样比较？", "Kafka 按组维护分区进度。RabbitMQ 的 consumer acknowledgment 告知 broker 消费端处理情况，publisher confirm 是独立的发布端确认。按实际故障路径验证重投。"],
      ],
    ),
    en: card(
      "Kafka consumer groups, offsets, and processing guarantees",
      "Use partition assignment, commit timing, and rebalances to explain ordering, concurrency, and duplicate processing.",
      "Use an order-event consumer that writes to a database to describe the failure window between offsets and business commits.",
      "In a stable assignment in a conventional Kafka consumer group, one member consumes each assigned partition. Ordering is per partition. The committed offset records where reading resumes. Processing before committing avoids skipping unprocessed records, but a crash after the business commit and before the offset commit can cause duplicate processing.\n\nCoordinate in-flight work and offsets as assignments change to avoid advancing out of order. When configured correctly, Kafka transactions can atomically commit Kafka output and consumer offsets, with consumers using read_committed. An external database needs explicit idempotency or transaction coordination.",
      ["Commit contiguous completed progress per partition so the offset never skips unfinished records.", "The partition count limits group-level consumer parallelism. A hot key can bottleneck one partition."],
      ["Committing before processing and expecting to reprocess after a crash.", "Assuming Kafka transactions also make external HTTP calls or database writes exactly once."],
      [
        ["Which record does an offset commit point to?", "The committed value normally represents the next position to read. Track contiguous completion per partition to avoid skipping pending work when concurrent operations finish out of order."],
        ["How does a rebalance affect in-flight records?", "Partitions can move to another member. On normal revocation, drain work within the client's allowed window and commit only the offset after the contiguous processed prefix. If ownership is already lost (for example, onPartitionsLost in the Java client), stop work and do not commit offsets for those partitions. Business processing must still tolerate duplicates."],
        ["How do you preserve event order for one order?", "Partition by a stable order key and preserve processing order for that key within the partition. Partition count changes and internal consumer concurrency can affect the ordering assumptions."],
        ["Can Kafka exactly-once semantics cover an external database?", "Kafka transactions can put Kafka outputs and offsets in one transaction, with downstream readers using committed data. An external database needs atomic deduplication, idempotent writes, or other coordination."],
        ["How do Kafka offset commits compare with RabbitMQ acknowledgments?", "Kafka tracks per-group partition progress. RabbitMQ consumer acknowledgments report consumer-side handling to the broker. Publisher confirms are a separate publishing-side mechanism. Verify redelivery on the actual failure path."],
      ],
    ),
  },
});
