import { card } from "../i18n/contentTypes";
import { bilingualTopics } from "./bilingualGroup";

export const networking = bilingualTopics("net", {
  "tcp-transport": {
    sources: ["rfc9293", "linux-ss"],
    zh: card(
      "TCP 连接、状态与排障",
      "用握手、字节流、流量控制与关闭状态解释常见网络故障。",
      "以请求间歇性连接超时或连接数上涨为例，从应用与网络两端定位。",
      "TCP 提供可靠、有序的字节流。建立连接时交换 SYN、SYN-ACK 和 ACK，双方同步序列号。消息边界由应用协议定义，接收窗口约束接收端承载，拥塞控制根据网络状况限制发送。\n\n关闭时两个方向分别结束。通常主动关闭方进入 TIME_WAIT，处理迟到报文和最终 ACK 丢失。CLOSE_WAIT 表示已收到对端 FIN，等待本地应用关闭。排查时把连接、TLS 和首字节阶段分开，结合 ss、日志和两端抓包定位。",
      ["流量控制保护接收端，拥塞控制应对网络路径拥塞。", "一次 write 与对端一次 read 的边界没有一一对应关系。"],
      ["将 TIME_WAIT 一律视为连接泄漏，直接修改内核参数。", "看到连接超时就判定应用慢，跳过路由、ACL 和握手检查。"],
      [
        ["为什么 TCP 需要三次握手？", "双方要同步初始序列号并确认对方收到自己的 SYN。握手也交换部分 TCP 选项。应用的 TLS 或协议握手在相应传输阶段另行处理。"],
        ["为什么应用会遇到所谓粘包或拆包？", "TCP 保留字节顺序，不提供应用消息边界。使用长度字段、分隔符或明确的协议帧，并支持部分读取。"],
        ["TIME_WAIT 与 CLOSE_WAIT 增多分别查什么？", "TIME_WAIT 先查连接复用和主动关闭速率。CLOSE_WAIT 持续积累时查本地应用关闭路径、连接持有者和描述符。"],
        ["怎样区分连接被拒绝与连接超时？", "拒绝常见于收到 RST，例如没有监听。超时常见于重传无响应或路径阻断。结合 errno、监听状态与抓包确认。"],
        ["如何定位跨网络的间歇性超时？", "按请求拆分 DNS、建连、TLS 和响应阶段。用 ss 检查连接与重传，并对照两端抓包和负载均衡器日志。"],
      ],
    ),
    en: card(
      "TCP connections, states, and diagnosis",
      "Explain network failures through handshakes, byte streams, flow control, and close states.",
      "Use intermittent connect timeouts or growing connection counts to trace application and network behavior.",
      "TCP supplies a reliable, ordered byte stream. Connection establishment exchanges SYN, SYN-ACK, and ACK to synchronize sequence numbers. The application protocol defines message boundaries. The receive window protects receiver capacity, and congestion control limits sending according to network conditions.\n\nEach direction closes separately. The active closer normally enters TIME_WAIT to handle delayed segments and loss of the final ACK. CLOSE_WAIT means the peer's FIN arrived and local close is pending. Separate connect, TLS, and first-byte stages, and correlate ss, logs, and packet captures on both ends.",
      ["Flow control protects the receiver. Congestion control addresses congestion along the network path.", "One write does not correspond to one read at the peer."],
      ["Treating all TIME_WAIT sockets as leaks and immediately tuning kernel parameters.", "Blaming application slowness for a connect timeout before checking the route, ACLs, and handshake."],
      [
        ["Why does TCP use a three-way handshake?", "Both sides synchronize their initial sequence numbers and acknowledge the peer's SYN. The handshake also exchanges some TCP options. TLS or application handshakes occur separately at the appropriate transport stage."],
        ["Why can application messages be coalesced or split on read?", "TCP preserves byte order and leaves message boundaries to the application. Use a length field, delimiter, or protocol framing, and support partial reads."],
        ["How do you investigate growing TIME_WAIT and CLOSE_WAIT counts?", "For TIME_WAIT, check connection reuse and active close rate. For accumulating CLOSE_WAIT, inspect local application cleanup, connection ownership, and descriptors."],
        ["How do connection refusal and connect timeout differ?", "Refusal commonly follows a TCP reset, for example if nothing is listening. Timeouts often follow unanswered retries or a blocked path. Verify with errno, listener state, and a packet capture."],
        ["How do you trace intermittent timeouts across a network?", "Measure DNS, connect, TLS, and response separately. Use ss to inspect connections and retransmits, then compare packet captures and load-balancer logs."],
      ],
    ),
  },
  "http-proxy": {
    sources: ["http-semantics", "rfc9113", "rfc9114", "rfc7239", "nginx-proxy", "nginx-upstream"],
    zh: card(
      "HTTP 协议与反向代理",
      "区分 HTTP 协议版本、转发边界和网关状态码，用分段耗时定位故障。",
      "以反向代理偶发 502 或 504 为例，关联上游连接、响应和应用日志。",
      "HTTP/1.1 支持持久连接。HTTP/2 在 TCP 连接上多路复用流，丢包仍可能阻塞该连接上多个流的交付。HTTP/3 使用 QUIC，独立流可避免因另一流缺少数据而等待。代理终止连接后，面向客户端与上游可采用不同协议和超时。\n\n502 表示网关收到无效的上游响应，503 表示暂时无法处理，504 表示网关未及时收到上游响应。对照代理错误日志、上游建连时间、首部时间和应用日志，而不是仅凭状态码归因。",
      ["Forwarded 或 X-Forwarded-* 只应从受信任代理链提取，边界要清理客户端伪造值。", "在 Nginx 中，proxy_read_timeout 衡量两次相邻读取之间的空闲时间。"],
      ["以为启用 HTTP/2 后代理到上游也自动改用同一协议。", "对所有代理错误自动重试，重复执行已被上游接受的写请求。"],
      [
        ["HTTP/2 如何缓解 HTTP/1.1 的队头阻塞？", "HTTP/2 在同一连接交错传输多个流的帧，减少应用层相互等待。TCP 丢包仍会让该连接的数据按序等待。"],
        ["HTTP/3 如何处理不同流的丢包？", "QUIC 为每个流独立交付有序数据，一个流中缺失的数据通常不阻塞其他流。各流仍共享连接级拥塞和带宽等约束。"],
        ["502 与 504 怎么查？", "先确定状态由哪一层生成。502 检查上游连接失败、复位或协议错误等日志。504 查连接或响应超时及依赖耗时，再与请求链路对齐。"],
        ["为什么不能直接信任 X-Forwarded-For？", "客户端能自行发送该头。配置受信任的代理与地址提取规则，在入口覆盖或清理不可信值。"],
        ["Nginx 的 proxy_read_timeout 是总请求时限吗？", "它限制两次上游读取之间的空闲时间。持续收到数据时响应可以持续更久。端到端预算要由合适的网关或应用截止时间管理。"],
      ],
    ),
    en: card(
      "HTTP protocols and reverse proxies",
      "Separate HTTP versions, forwarding boundaries, and gateway status codes, then diagnose by request stage.",
      "Use intermittent 502 or 504 responses to correlate upstream connection timing, responses, and application logs.",
      "HTTP/1.1 supports persistent connections. HTTP/2 multiplexes streams on TCP, where loss can still stall delivery across streams on the same connection. HTTP/3 uses QUIC. Independent streams can avoid waiting for missing data in another stream. A terminating proxy may use different protocols and timeouts on the client-facing and upstream connections.\n\nA 502 indicates an invalid upstream response at a gateway, a 503 indicates temporary unavailability, and a 504 indicates a gateway did not get an upstream response in time. Correlate proxy errors, upstream connect and header times, and application logs before attributing the cause.",
      ["Use Forwarded or X-Forwarded-* only from a trusted proxy chain, and sanitize client-supplied values at the boundary.", "Nginx proxy_read_timeout applies to the idle interval between successive reads."],
      ["Assuming that enabling HTTP/2 on a proxy automatically uses it on the upstream hop.", "Retrying every proxy error and duplicating a write already accepted upstream."],
      [
        ["How does HTTP/2 mitigate HTTP/1.1 head-of-line blocking?", "It interleaves frames from several streams on one connection, reducing application-layer waiting. TCP loss still makes data on that connection wait for in-order delivery."],
        ["How does HTTP/3 handle loss across streams?", "QUIC delivers ordered data per stream. Missing data on one stream generally does not block another. Streams still share connection-level congestion and bandwidth constraints."],
        ["How do you diagnose a 502 versus a 504?", "Find the layer that generated the status. For 502, check upstream failures such as connection errors, resets, or protocol problems. For 504, inspect connect or response timeouts and dependency timing, then correlate with the request trace."],
        ["Why can't you trust X-Forwarded-For directly?", "Clients can send the header themselves. Configure trusted proxies and extraction rules, and overwrite or sanitize untrusted values at ingress."],
        ["Is Nginx proxy_read_timeout a total request deadline?", "It bounds the idle interval between two upstream reads. A response that keeps delivering data can run longer. Use an appropriate gateway or application deadline for the end-to-end budget."],
      ],
    ),
  },
});
