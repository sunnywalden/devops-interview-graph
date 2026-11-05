import type { ReactNode } from "react";
import { Button, Layout as AntLayout, Menu, Typography } from "antd";
import {
  ApartmentOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  ReadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { Bookmark, PageId } from "../types";
import { BookmarkBanner } from "./BookmarkBanner";

const { Header, Content, Footer } = AntLayout;

const ITEMS: { key: PageId; href: string; label: string; icon: ReactNode }[] = [
  {
    key: "overview",
    href: "#/overview",
    label: "总览",
    icon: <ApartmentOutlined />,
  },
  { key: "lang", href: "#/lang", label: "①语言", icon: <ReadOutlined /> },
  {
    key: "mid",
    href: "#/mid",
    label: "②中间件",
    icon: <ClusterOutlined />,
  },
  {
    key: "scene",
    href: "#/scene",
    label: "③场景",
    icon: <DeploymentUnitOutlined />,
  },
];

export function Layout({
  page,
  bookmark,
  onContinue,
  focusMode,
  onExitFocus,
  children,
}: {
  page: PageId;
  bookmark: Bookmark | null;
  onContinue: () => void;
  focusMode: boolean;
  onExitFocus: () => void;
  children: ReactNode;
}) {
  return (
    <AntLayout
      className={focusMode ? "app-shell app-shell--focus" : "app-shell"}
      style={{ minHeight: "100vh" }}
    >
      <Header className="app-header">
        <Typography.Link className="app-brand" href="#/overview">
          面试作战台
        </Typography.Link>
        {!focusMode && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[page]}
            items={ITEMS.map((it) => ({
              key: it.key,
              icon: it.icon,
              label: <a href={it.href}>{it.label}</a>,
            }))}
            style={{ flex: 1, minWidth: 0 }}
          />
        )}
        <div className="app-header-actions">
          {focusMode ? (
            <Button
              type="primary"
              size="small"
              className="focus-exit-btn"
              icon={<CloseOutlined />}
              onClick={onExitFocus}
              aria-label="退出口播焦点模式"
            >
              退出焦点 · Esc
            </Button>
          ) : (
            <BookmarkBanner
              bookmark={bookmark}
              onContinue={onContinue}
              compact
              activePage={page}
            />
          )}
        </div>
      </Header>
      <Content>
        <div className="page-content">{children}</div>
      </Content>
      {!focusMode && <Footer className="app-footer">离线 · 进度仅本机</Footer>}
    </AntLayout>
  );
}
