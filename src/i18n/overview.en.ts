import type { StarStory, SprintDay } from '../types';

export const narrative = 'This capability map connects languages, infrastructure and engineering scenarios. Go and Python support service development, and Shell supports operations automation. Databases, messaging and Kubernetes provide data and execution foundations. Delivery, observability and asset management combine these capabilities into verifiable engineering solutions.';
const evidence = 'Experience outline · Verify against your own work. Complete this draft with code, design records, operational data and your actual responsibilities. Do not present a reference design as a personal achievement.';
export const starStories: StarStory[] = [
  { id: 'mingfu', label: 'CMDB / Fixed assets', role: 'Go platform · CMDB and fixed assets', layerMap: 'Go / go-zero → MongoDB / messaging → CMDB / reporting',
    s: 'Describe the CMDB and fixed-asset domain, data volume, and specific problems with aggregation queries, duplicate jobs or cross-system consistency.',
    t: 'Identify the APIs, background jobs or data workflows you owned, including latency, freshness and consistency requirements.',
    a: 'Explain the Go services, precomputed read models, batch writes and concurrency limits actually implemented. For idempotency, leases or Sagas, describe durable state, resource-side conditions, compensation and reconciliation. Label unimplemented mechanisms as proposals.',
    r: 'Evidence to add: before-and-after query latency, computation delay, resource consumption, duplicate-execution tests and reconciliation results. Without measurements, state only delivered functionality and how it was verified.',
    followUp: 'What makes an operation idempotent? Which resource rejects a stale lease holder? How do retries recover partial batch failures? How is the read model rebuilt and reconciled?', evidence },
  { id: 'bili', label: 'Resource efficiency / Logs', role: 'CMDB / Resource efficiency / Logs', layerMap: 'MySQL / Redis → Logging / Monitoring costs',
    s: 'Describe resource-management and log-search use cases, the main performance or cost problems, and the required service quality.',
    t: 'Define your ownership of queries, caching, log indexes or capacity. Separate your contribution from the team’s overall results.',
    a: 'Use evidence to explain query optimization, cache updates, hot-key mitigation, log fields and lifecycle policies. Explain consistency versus cost and the load tests, staged rollout and rollback.',
    r: 'Evidence to add: availability scope and measurement period, bills, traffic and price changes, and comparable baselines. Historical availability and savings figures are not verified by this project and must not be reused as established results.',
    followUp: 'How are stale values handled during cache updates? Can hot keys be distributed? How are shard counts and retention chosen? How are traffic and price changes separated from optimization savings?', evidence },
  { id: 'tezign', label: 'Operations platform / CI / Audit', role: 'Operations platform / CI / Monitoring / Audit', layerMap: 'Python → Kubernetes → CI / Operations platform / Monitoring',
    s: 'Describe fragmented cloud-resource, delivery, monitoring and SQL-review workflows, including tenant authorization and workflow-consistency constraints.',
    t: 'Identify the platform modules, interfaces and operational duties you owned and the specific user workflows to improve.',
    a: 'Explain Django authorization, Terraform state, GitLab templates, artifacts, scanning and monitoring using the versions actually deployed. Identify the historical version if Kaniko was used; evaluate a maintained builder for new work. Do not count planned features as delivered.',
    r: 'Evidence to add: adoption, delivery time, failure rate, authorization tests, audit coverage and maintenance cost. Use release records and tests; calling a solution a platform does not demonstrate its benefits.',
    followUp: 'Does tenant isolation cover lists, jobs and exports? What protects runners beyond tags? How is a state lock recovered? How do you distinguish successful scraping from upstream health?', evidence },
  { id: 'cr', label: 'Configuration / Container delivery', role: 'Configuration management and container delivery', layerMap: 'Kubernetes → Configuration / Delivery',
    s: 'Describe actual environment drift, compatibility or recovery problems in configuration and container releases, and identify the deployment environment.',
    t: 'Define your ownership of configuration generation, versioning or delivery, with acceptance criteria for deployment and rollback.',
    a: 'Explain implemented template validation, image/configuration version binding, Secret delivery, probes, rolling updates and traffic draining. Handle database compatibility and recovery separately from application rollout.',
    r: 'Evidence to add: release-time error rates and latency, rollback drills and configuration consistency checks. Do not claim zero or near-zero downtime without measuring business interruption.',
    followUp: 'Which ConfigMap mount modes receive updates? How do readiness and connection draining work together? Are configuration and data still compatible when the image is rolled back?', evidence },
  { id: 'huawei', label: 'HPC backup and recovery', role: 'HPC backup and recovery (Java + Shell)', layerMap: 'Operations / Backup · Methods transferable to Go roles',
    s: 'Describe HPC datasets, backup windows, storage dependencies and recovery requirements. Identify the original Java and Shell implementation.',
    t: 'Explain your ownership of orchestration, storage integration, verification or drills, with the agreed RPO and RTO.',
    a: 'Use records to explain full/incremental backups, retries, isolated copies, checksums and restoration. Distinguish file integrity, data consistency and business-job validation. When discussing Go, describe transferable methods only.',
    r: 'Evidence to add: recoverable points in time, drill duration, recovery scope and business-validation records. Backup-job success does not prove recovery, and a Java/Shell project is not Go experience.',
    followUp: 'How is the incremental chain verified? How are required keys and versions recovered? Which business jobs are exercised? If the window is too short, how do throughput and source-system load trade off?', evidence },
];
const day = (label: string, items: [string, string][]): SprintDay => ({label, items: items.map(([label, value]) => ({label, value}))});
export const sprint5d = [
  day('Day 1 · Languages', [['Understand', 'Go scheduling, cancellation, interfaces and errors; Python GIL, asyncio, authorization and types.'], ['Check', 'Read key official references. Record version conditions and uncertainties.'], ['Practice', 'Answer independently, then use follow-up questions to check mechanisms, boundaries and examples.']]),
  day('Day 2 · Data and consistency', [['Understand', 'Transactions, replication, caching and retries in MySQL, MongoDB, Redis and messaging.'], ['Practice', 'Connect CMDB idempotency, leases, Sagas, workers and reconciliation.']]),
  day('Day 3 · Delivery and runtime', [['Understand', 'GitLab CI, image building, Kubernetes, Terraform and GitOps.'], ['Practice', 'Draw the path from code to deployment, including validation, authorization, failure and rollback.']]),
  day('Day 4 · Observability and operations', [['Understand', 'Metrics, SLOs, logs, tracing, secrets, incident response and recovery.'], ['Verify', 'Collect project responsibilities, designs, metric definitions and operational evidence.']]),
  day('Day 5 · Mock interview', [['Practice', 'Use follow-up questions to test diagnosis, trade-offs and boundary conditions.'], ['Produce', 'Prepare evidence-based STAR outlines and a list of remaining knowledge gaps.']]),
];
export const sprint3d = [
  day('Day 1 · Languages and data', [['Focus', 'Go and Python semantics; database, cache and messaging consistency.'], ['Produce', 'A CMDB design diagram and project facts that still need verification.']]),
  day('Day 2 · Delivery and platforms', [['Focus', 'CI, Kubernetes, Terraform, GitOps and authorization boundaries.'], ['Produce', 'Deployment and rollback flows, plus a platform-project outline.']]),
  day('Day 3 · Validation and practice', [['Focus', 'Observability, incident response, capacity, secrets and recovery validation.'], ['Produce', 'Complete mock follow-up questions and list the topics still not understood.']]),
];
export const sprintTips = [
  'Explain the concept independently before revealing the answer. Repeating an explanation does not prove you can handle counterexamples.',
  'Organize answers around conclusions, mechanisms, assumptions and verification. A fixed speaking duration is a guide, not a requirement.',
  'Distinguish language specifications, runtime implementations and product configuration. Check the references for version-sensitive behavior.',
  'Use actual responsibilities and verifiable facts in project stories. Make your contribution and unimplemented ideas explicit.',
  'Progress records opened topics only. Assess understanding through questions, examples and practical validation.',
];
export const checklist = [
  'Languages: explain execution, concurrency, cancellation, errors and types in Go and Python, along with Shell expansion, exit status and script portability.',
  'Data: distinguish transaction, replication, cache and messaging guarantees, including cross-system boundaries.',
  'Runtime: explain Kubernetes networking, storage, probes, permissions and diagnosis.',
  'Delivery: explain artifact provenance, testing, deployment, rollback and infrastructure state.',
  'Operations: define SLIs/SLOs, correlate metrics, logs and traces, and verify recovery and capacity.',
  'Projects: support responsibilities and results with evidence; give metrics a baseline, period, definition and source.',
  'Learning: inspect the remaining topics in each group and add unresolved questions to your revision list.',
];
export const diagramCopy: Record<string, [string, string]> = {
  go: ['Golang', 'Parallel language path · Services and concurrency'], py: ['Python', 'Parallel language path · Platforms and automation'], mysql: ['MySQL', 'Relational data / Transactions'], mongo: ['MongoDB', 'Documents / Replication'], redis: ['Redis', 'Caching / Data structures'], mq: ['Messaging', 'Reliability / Ordering / Backlogs'], docker: ['Docker', 'Images / Containers'], k8s: ['Kubernetes', 'Architecture / Orchestration'], net: ['DNS / TLS', 'Name resolution / Certificates'], cicd: ['CI/CD', 'GitLab / Supply chain'], monitor: ['Monitoring', 'Prometheus / SLOs / Alerts'], log: ['Logging', 'ELK / Structured logs'], ops: ['Operations platform', 'IaC / GitOps'], cmdb: ['CMDB', 'Assets / Consistency'], report: ['Reporting', 'Dashboards / Precomputation'], other: ['Operations', 'Secrets / On-call / Capacity'],
};
