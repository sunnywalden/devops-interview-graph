import { Collapse, List, Space, Typography, theme } from "antd";
import {
  AlertOutlined,
  BookOutlined,
  CommentOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import type { Card as CardType } from "../types";
import { Callout } from "./Callout";
import { DiagramPanel } from "./diagrams/DiagramPanel";

const { Paragraph, Text } = Typography;

export function CardView({ card }: { card: CardType }) {
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }} key={card.id}>
      {card.warning && (
        <Callout lead="诚实边界" tone="warn">
          {card.warning}
        </Callout>
      )}

      <header className="card-head print-keep">
        <h2 className="card-head__title">{card.label}</h2>
        <Paragraph className="card-head__one">{card.oneLiner}</Paragraph>
        <Paragraph className="card-head__resume print-hide">
          简历锚点 · {card.resumeAnchor}
        </Paragraph>
      </header>

      <section className="oral-hero print-keep" aria-label="60–90 秒口述">
        <div className="oral-hero__label">
          <CommentOutlined />
          60–90 秒口述
        </div>
        <div className="oral-block">{card.oral}</div>
      </section>

      <div className="print-hide">
        <DiagramPanel visuals={card.visuals} />
      </div>

      <div id="card-followups" className="print-hide">
      <Collapse
        key={card.id}
        defaultActiveKey={["followUps"]}
        items={[
          {
            key: "followUps",
            label: (
              <Space>
                <QuestionCircleOutlined />
                追问（{card.followUps.length}）
              </Space>
            ),
            children: (
              <List
                dataSource={card.followUps}
                renderItem={(f) => (
                  <List.Item>
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Text strong style={{ color: token.colorPrimary }}>
                        追问：{f.q}
                      </Text>
                      <Text>{f.a}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: "principles",
            label: (
              <Space>
                <BookOutlined />
                原理（{card.principles.length}）
              </Space>
            ),
            children: (
              <List
                dataSource={card.principles}
                renderItem={(p, i) => (
                  <List.Item>
                    <Text>
                      <Text strong>原理{i + 1}：</Text>
                      {p}
                    </Text>
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: "pitfalls",
            label: (
              <Space>
                <AlertOutlined />
                易错（{card.pitfalls.length}）
              </Space>
            ),
            children: (
              <List
                dataSource={card.pitfalls}
                renderItem={(p) => <List.Item>{p}</List.Item>}
              />
            ),
          },
        ]}
      />
      </div>
    </Space>
  );
}
