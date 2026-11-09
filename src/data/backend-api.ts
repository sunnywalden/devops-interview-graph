import { card } from "../i18n/contentTypes";
import { bilingualGroup } from "./bilingualGroup";

export const api = bilingualGroup("api", "后端 API", "api-http", {
  "api-http": {
    sources: ["http-semantics", "http-rate-limit", "stripe-idempotency"],
    zh: card(
      "HTTP 契约、幂等与并发更新",
      "用请求方法、状态码、幂等键和条件请求设计可重试的 API。",
      "以创建订单和更新配置为例，定义客户端超时、重复提交与并发编辑的行为。",
      "HTTP 方法的幂等性描述同一请求重复执行时，服务端预期效果与执行一次相同。PUT 和 DELETE 具有幂等语义，响应可以变化。对需要重试的创建请求，可在接口契约中约定幂等键，按调用方和操作划分作用域，原子地认领键，校验请求内容是否一致，并处理在途与已结束的请求。跨服务副作用还需要下游去重或可恢复的状态机。\n\n用 201 表示资源已经创建，202 表示请求已接受但处理尚未完成。对并发编辑，返回 ETag 并要求写请求带上 If-Match。服务端应在同一更新边界内检查版本，前置条件不满足时返回 412，避免覆盖他人的修改。",
      ["明确幂等键的保留期、重复响应规则以及在途请求的处理方式。", "为异步操作提供可查询状态的标识，让客户端区分处理中、成功与失败。"],
      ["把 202 当作异步操作已经成功的证明。", "先查询幂等键再无条件创建资源，留下并发竞态。"],
      [
        ["第一次 DELETE 返回 204，第二次返回 404，还算幂等吗？", "可以。如果两次调用的预期效果都是资源处于已删除状态，响应状态码不同并不破坏幂等性。"],
        ["两个相同幂等键的请求同时到达，如何处理？", "按调用方和操作给键加唯一约束或用原子写入认领。拒绝同键不同请求内容。对同一请求，按契约返回已有结果，或告知客户端仍在处理。"],
        ["什么时候用 409、422 或 429？", "409 表示请求与资源当前状态冲突，422 表示服务端理解内容类型且内容语法正确，但无法处理其中的指令，429 表示请求过多。限流响应可带 Retry-After。客户端重试还要受总预算约束。"],
        ["如何防止两个管理员覆盖彼此的更新？", "读取时返回强 ETag。写入时使用 If-Match，并在持久化操作中以对应版本作为更新条件。If-Match 不匹配时返回 412，客户端刷新后再决定如何合并。"],
        ["大列表如何设计游标分页？", "使用稳定排序和唯一的最终排序键，游标保存上一页边界。把游标绑定到查询范围与排序，并明确并发插入、更新或删除时的可见性规则。"],
      ],
    ),
    en: card(
      "HTTP contracts, idempotency, and concurrent updates",
      "Use methods, status codes, idempotency keys, and conditional requests to design a retryable API.",
      "Use order creation and configuration edits to define behavior for timeouts, duplicate submissions, and concurrent updates.",
      "An HTTP method is idempotent when repeating the same request has the same intended server-side effect as making it once. PUT and DELETE have idempotent semantics even when the responses differ. For retryable creation requests, define an idempotency key in the API contract. Scope it to the caller and operation, claim it atomically, check that the request content matches, and distinguish in-flight requests from completed ones. Cross-service effects still need downstream deduplication or a recoverable state machine.\n\nUse 201 when a resource has been created and 202 when a request has been accepted and processing has yet to complete. For concurrent editing, return an ETag and require If-Match on writes. Check the version as part of the update and return 412 when the precondition fails to prevent lost updates.",
      ["Define key retention, replay behavior, and how to respond to in-flight requests.", "Provide a status identifier for asynchronous operations so callers can distinguish pending, successful, and failed operations."],
      ["Treating 202 as proof that an asynchronous operation succeeded.", "Looking up an idempotency key and then creating the resource unconditionally, leaving a race."],
      [
        ["Is DELETE still idempotent if it returns 204 first and 404 later?", "It can be. If the intended effect of both calls is that the resource is absent, different status codes do not break idempotency."],
        ["How do you handle two simultaneous requests with the same idempotency key?", "Claim the key atomically, for example with a uniqueness constraint scoped to the caller and operation. Reject mismatched content. For a matching request, replay the existing result or report that it is still in progress according to the contract."],
        ["When do you use 409, 422, or 429?", "409 signals a conflict with the resource's current state. 422 signals that the server understands the content type and the content is syntactically valid, but it cannot process the instructions. 429 signals too many requests. A rate limit response can include Retry-After, and client retries still need an overall budget."],
        ["How do you keep two administrators from overwriting each other's changes?", "Return a strong ETag on read. Send If-Match on write and include the corresponding version in the persistent update condition. Return 412 when If-Match fails so the client can reload and decide how to merge."],
        ["How do you design cursor pagination for a large collection?", "Use a stable sort with a unique final sort key. The cursor stores the previous page's boundary. Bind it to the query scope and sort, and define visibility when rows are inserted, updated, or deleted between pages."],
      ],
    ),
  },
  "api-security": {
    sources: ["owasp-bola", "oidc-core", "oauth-security-bcp", "jwt-bcp", "owasp-csrf", "fetch-standard"],
    zh: card(
      "API 身份验证、授权与租户隔离",
      "区分身份、令牌验证与对象级授权，在每次数据访问时约束权限。",
      "用按租户访问订单和导出任务说明授权范围、令牌边界与跨域请求。",
      "认证回答调用方是谁，授权判断它能对特定资源执行什么操作。对象级授权应覆盖详情、列表、批量修改和后台任务。使用可信身份上下文确定租户和权限，在读取与写入查询中施加范围约束。请求中的 tenant_id 和不透明的资源 ID 都不能替代授权。\n\nOAuth 2.0 为委托授权提供框架，OpenID Connect 在其上提供身份层。验证 JWT 时按令牌类型与信任配置核对签名算法、密钥、发行者、受众和有效期。API 应按协议接受适用于该资源的访问令牌，并执行服务端授权策略。",
      ["以跨租户访问、批量参数和异步执行为测试用例，覆盖对象级授权。", "使用 Cookie 认证的浏览器接口需评估 CSRF，按场景配置 SameSite、令牌校验或来源校验。"],
      ["验证 JWT 签名后便跳过受众检查或资源权限判断。", "配置了 CORS 就允许所有带有效会话的请求变更资源。"],
      [
        ["不可预测的 UUID 可以解决对象级越权吗？", "UUID 可降低枚举机会。服务端仍须验证当前身份是否对请求的每个对象具有对应操作权限。"],
        ["Access Token 和 ID Token 各由谁使用？", "Access Token 供客户端访问相应资源服务。OIDC 的 ID Token 向客户端表达认证结果。资源服务按自己的受众和令牌校验规则接受访问令牌。"],
        ["如何处理 JWT 密钥轮换？", "基于受信发行者的配置取得公钥，按受支持的算法和密钥标识选择密钥，有界刷新缓存，并按轮换计划保留过渡期验证能力。拒绝未知密钥或不符合校验规则的令牌。"],
        ["CORS 与 CSRF 防护的职责有何不同？", "CORS 是浏览器控制跨源响应共享的机制，部分请求还会预检。CSRF 防护针对浏览器自动携带凭证触发的非预期操作，服务端需要单独校验。"],
        ["队列任务如何保持租户隔离？", "创建任务时授权并保存可信的租户、主体和资源范围，执行时依据任务的安全策略验证权限或有效授权。读写按租户过滤，并审计身份与影响范围。"],
      ],
    ),
    en: card(
      "API authentication, authorization, and tenant isolation",
      "Separate identity, token validation, and object-level authorization, and scope every data access.",
      "Use tenant-scoped orders and export jobs to explain authorization, token boundaries, and cross-origin requests.",
      "Authentication establishes who is calling. Authorization decides which operation that caller may perform on a specific resource. Apply object-level authorization to detail views, listings, bulk changes, and background jobs. Derive tenant and permission scope from trusted identity context and enforce it in read and write queries. A caller-supplied tenant_id and opaque resource IDs cannot substitute for authorization.\n\nOAuth 2.0 provides a delegated authorization framework. OpenID Connect adds an identity layer. Validate a JWT's signature algorithm, key, issuer, audience, and validity period against the token type and trust configuration. APIs should accept access tokens intended for the resource under the applicable protocol and enforce their own authorization policy.",
      ["Test object-level authorization with cross-tenant requests, bulk inputs, and asynchronous execution.", "Assess CSRF on browser APIs that authenticate with cookies. Use SameSite, token checks, or origin checks as appropriate."],
      ["Verifying a JWT signature and then skipping the audience or resource permission check.", "Assuming a CORS configuration makes it safe to accept every state-changing request with a valid session."],
      [
        ["Do unpredictable UUIDs prevent broken object-level authorization?", "UUIDs reduce the opportunity for enumeration. The server must still check that the caller may perform the requested operation on each object."],
        ["Who uses an access token and who uses an ID token?", "The client uses an access token to access the intended resource server. An OIDC ID token conveys the authentication result to the client. The resource server accepts access tokens under its own audience and validation rules."],
        ["How do you handle JWT key rotation?", "Use public keys from the trusted issuer configuration, select the key and algorithm according to policy, refresh the cache with bounds, and follow the planned overlap for verification. Reject unknown keys or tokens that fail validation."],
        ["How do CORS and CSRF defenses differ?", "CORS controls cross-origin response sharing in browsers, with preflights for some requests. CSRF defenses address unwanted actions triggered with automatically attached credentials and require separate server-side checks."],
        ["How do queued jobs preserve tenant isolation?", "Authorize at creation and record trusted tenant, principal, and resource scope. At execution, check current permissions or a valid grant under the job's security policy. Scope reads and writes by tenant and audit the identity and affected resources."],
      ],
    ),
  },
  "api-resilience": {
    sources: ["aws-retry-jitter", "grpc-deadlines", "sre-capacity"],
    zh: card(
      "超时、重试、限流与熔断",
      "从端到端延迟预算出发，限制失败放大，保护依赖与正常流量。",
      "用聚合服务调用多个下游的案例解释剩余预算、降级与故障恢复。",
      "入口请求设置总截止时间，下游调用按剩余预算设置超时，并传播取消信号。只对适合重试的失败和具备重试安全性的操作进行有界重试，使用指数退避与随机抖动，并保留总预算。网络超时也可能发生在服务端已经提交之后。\n\n限流约束单位时间的请求量，并发上限约束在途工作，熔断在依赖持续失败时让调用快速失败。隔离关键与非关键依赖的队列和连接配额。恢复时限制探测流量，监控成功率、尾延迟、超时、重试次数和拒绝量。",
      ["在同一调用链上尽量由一处控制重试，避免逐层放大。", "为降级结果定义新鲜度、完整性与可观测性约束。"],
      ["每次重试都重新获得完整超时，超过上游预算。", "用无限排队掩盖饱和，最终消耗连接与内存。"],
      [
        ["上游还剩 150 ms，下游该配置多大的超时？", "从剩余时间中扣除本地收尾和返回所需时间，给下游分配更短的有界超时。若预算不足，立即失败或走已定义的降级路径。"],
        ["客户端超时后可以重试创建接口吗？", "先判断操作是否有可验证的幂等契约，或能否通过稳定业务标识查询结果。超时无法证明首次请求未生效。"],
        ["每层最多尝试三次，为什么仍可能压垮服务？", "如果三个调用层各最多尝试三次（含首次），且每次尝试都会触发下一层调用，最底层最多被调用 3³ = 27 次。集中控制重试并同时限制次数、时间与重试流量。"],
        ["限流、熔断和隔离各解决什么问题？", "限流限制进入的速率。熔断在依赖故障时减少继续调用。隔离为不同流量或依赖配置独立容量，减少故障传播。"],
        ["如何证明韧性设计有效？", "注入延迟、错误和部分不可用，验证请求预算、底层请求放大比例和隔离效果。观察成功率、p95/p99、排队时间和恢复过程。"],
      ],
    ),
    en: card(
      "Timeouts, retries, rate limiting, and circuit breaking",
      "Start with an end-to-end latency budget to bound failure amplification and protect dependencies and healthy traffic.",
      "Use an aggregation service with several downstream calls to explain remaining budget, degradation, and recovery.",
      "Set an end-to-end deadline on the incoming request. Set downstream timeouts from the remaining budget and propagate cancellation. Retry only eligible failures and operations safe to retry. Bound attempts, use exponential backoff with jitter, and respect the overall budget. A network timeout can occur after the server has committed.\n\nRate limiting caps arrivals over time, a concurrency limit caps in-flight work, and a circuit breaker fails fast when a dependency keeps failing. Isolate queue and connection capacity for critical and noncritical dependencies. Limit probes during recovery and monitor success rate, tail latency, timeouts, retries, and rejections.",
      ["Prefer one layer to own retries along a call path to limit amplification.", "Define freshness, completeness, and observability for degraded responses."],
      ["Giving each retry a full new timeout and exceeding the upstream budget.", "Masking saturation with an unbounded queue until it consumes connections and memory."],
      [
        ["If the upstream has 150 ms left, how long should the downstream timeout be?", "Reserve time for local work and the response, then allocate a shorter bounded timeout. Fail promptly or use a defined fallback when the remaining budget is too small."],
        ["Can a client retry a creation request after it times out?", "Check for a verifiable idempotency contract or a way to look up the result using a stable business identifier. A timeout does not establish that the first request had no effect."],
        ["Why can three attempts per layer still overwhelm a service?", "If each of three calling layers makes up to three attempts, including the initial call, and each attempt invokes the next layer, the deepest service can see up to 3³ = 27 calls. Centralize retries and cap attempts, elapsed time, and retry traffic."],
        ["What problems do rate limiting, circuit breaking, and isolation solve?", "Rate limiting caps admission rate. Circuit breaking reduces calls to a failing dependency. Isolation gives separate capacity to different traffic classes or dependencies to contain failures."],
        ["How do you verify that resilience measures work?", "Inject latency, errors, and partial unavailability to verify budgets, downstream amplification, and isolation. Observe success rate, p95/p99, queue delay, and recovery."],
      ],
    ),
  },
});
