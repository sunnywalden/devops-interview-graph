import { lazy, Suspense, useMemo } from "react";
import {
  Card,
  Col,
  List,
  Row,
  Segmented,
  Select,
  Space,
  Typography,
  Spin,
} from "antd";
import {
  CheckSquareOutlined,
  NodeIndexOutlined,
  RocketOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  narrative,
  starStories,
  sprint5d,
  sprint3d,
  sprintTips,
  checklist,
} from "../data/overview";

const OverviewFlow = lazy(() =>
  import("../components/diagrams/OverviewFlow").then((m) => ({
    default: m.OverviewFlow,
  })),
);

const { Title, Paragraph, Text } = Typography;

export function OverviewPage({
  star,
  plan,
  onStar,
  onPlan,
}: {
  star: string;
  plan: "5d" | "3d";
  onStar: (id: string) => void;
  onPlan: (id: "5d" | "3d") => void;
}) {
  const story = useMemo(
    () => starStories.find((s) => s.id === star) ?? starStories[0],
    [star],
  );
  const days = plan === "5d" ? sprint5d : sprint3d;

  const layerLinks = [
    {
      href: "#/lang",
      num: "①",
      title: "语言层",
      site: "Golang / Python",
    },
    {
      href: "#/mid",
      num: "②",
      title: "中间件",
      site: "MySQL · Redis · K8s…",
    },
    {
      href: "#/scene",
      num: "③",
      title: "场景层",
      site: "CI/CD · 监控 · CMDB…",
    },
  ];

  return (
    <Space direction="vertical" size={32} style={{ width: "100%" }}>
      <div>
        <Title level={2} style={{ marginBottom: 6, fontSize: 22 }}>
          三层知识图谱 · 总览
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 0, maxWidth: "42rem" }}>
          {narrative}
        </Paragraph>
      </div>

      <nav className="layer-portals" aria-label="三层入口">
        {layerLinks.map((l) => (
          <a key={l.href} className="layer-portal" href={l.href}>
            <span className="layer-portal__num">{l.num}</span>
            <span>
              <strong>{l.title}</strong>
              <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                {l.site}
              </span>
            </span>
          </a>
        ))}
      </nav>

      <section className="page-section" aria-labelledby="layers">
        <Title level={3} id="layers" style={{ marginBottom: 8 }}>
          <NodeIndexOutlined /> 三层关系
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16, maxWidth: "46rem" }}>
          语言 → 中间件/容器 → DevOps 场景。边上是支撑 / 用于构建，不是运行时单向调用链。
          Golang 与 Python 同层并列。可缩放平移下图。
        </Paragraph>
        <div className="overview-flow-wrap">
          <Suspense
            fallback={
              <div style={{ padding: 64, textAlign: "center" }}>
                <Spin tip="加载交互图谱…" />
              </div>
            }
          >
            <OverviewFlow />
          </Suspense>
          <div className="overview-legend" aria-label="图例">
            <span className="lg-l1">① 语言</span>
            <span className="lg-l2">② 中间件 / 基础设施</span>
            <span className="lg-l3">③ DevOps 场景</span>
            <span className="lg-edge">边 = 支撑 / 构建</span>
          </div>
        </div>
      </section>

      <section className="page-section" aria-labelledby="star">
        <Title level={3} id="star" style={{ marginBottom: 8 }}>
          <StarOutlined /> 项目 90 秒 STAR
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          主攻明赋云、B 站、特赞；华润/华为补强。讲 STAR 时点出落到哪一层。
        </Paragraph>
        <Select
          style={{ width: "100%", maxWidth: 420, marginBottom: 16 }}
          value={story.id}
          options={starStories.map((s) => ({ value: s.id, label: s.label }))}
          onChange={onStar}
          aria-label="项目"
        />
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Card title="角色 / 层映射">
              <Space direction="vertical" size={12}>
                <div>
                  <Text type="secondary">角色 · </Text>
                  <Text>{story.role}</Text>
                </div>
                <div>
                  <Text type="secondary">层映射 · </Text>
                  <Text>{story.layerMap}</Text>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={14}>
            <Card title="STAR 口播">
              <List
                dataSource={[
                  { k: "S（20s）", v: story.s },
                  { k: "T（10s）", v: story.t },
                  { k: "A（40s）", v: story.a },
                  { k: "R（20s）", v: story.r },
                ]}
                renderItem={(it) => (
                  <List.Item>
                    <div className="star-oral-block">
                      <Text strong>{it.k} </Text>
                      {it.v}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="追问速答">{story.followUp}</Card>
          </Col>
        </Row>
      </section>

      <section className="page-section" aria-labelledby="sprint">
        <Title level={3} id="sprint" style={{ marginBottom: 8 }}>
          <RocketOutlined /> 3～5 天冲刺
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          日程对齐三层子页；GitLab CI 六卡在场景层，列为必背。
        </Paragraph>
        <List
          bordered
          style={{ marginBottom: 20 }}
          header={
            <Space>
              <CheckSquareOutlined />
              冲刺清单
            </Space>
          }
          dataSource={checklist}
          renderItem={(c) => <List.Item>☐ {c}</List.Item>}
        />
        <div className="segmented-wrap" style={{ marginBottom: 16 }}>
          <Segmented
            value={plan}
            options={[
              { value: "5d", label: "5 天版" },
              { value: "3d", label: "3 天压缩" },
            ]}
            onChange={(v) => onPlan(v as "5d" | "3d")}
            aria-label="冲刺计划"
          />
        </div>
        <Row gutter={[16, 16]}>
          {days.map((d) => (
            <Col xs={24} sm={12} md={8} lg={6} key={d.label}>
              <Card className="sprint-day-card" title={d.label}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {d.items.map((it) => (
                    <div key={it.label}>
                      <span className="sprint-item-label">{it.label}</span>
                      <Text style={{ fontSize: 13 }}>{it.value}</Text>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        <List
          style={{ marginTop: 20 }}
          header="冲刺提示"
          dataSource={sprintTips}
          renderItem={(t, i) => (
            <List.Item>
              <Text>
                {i + 1}. {t}
              </Text>
            </List.Item>
          )}
        />
        <nav className="layer-portals" style={{ marginTop: 16 }} aria-label="去开练">
          {[
            { href: "#/lang", num: "①", title: "去语言层开练", site: "Day1" },
            { href: "#/mid", num: "②", title: "去中间件开练", site: "Day2" },
            { href: "#/scene", num: "③", title: "去场景层开练", site: "Day3–4" },
          ].map((l) => (
            <a key={l.href} className="layer-portal" href={l.href}>
              <span className="layer-portal__num">{l.num}</span>
              <span>
                <strong>{l.title}</strong>
                <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
                  {l.site}
                </span>
              </span>
            </a>
          ))}
        </nav>
      </section>
    </Space>
  );
}
