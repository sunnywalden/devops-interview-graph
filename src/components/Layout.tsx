import type { MouseEvent, ReactNode } from "react";
import {
  ApartmentOutlined, ClusterOutlined, CodeOutlined, DeploymentUnitOutlined,
  ArrowUpOutlined, CheckCircleOutlined, CloseOutlined,
} from "@ant-design/icons";
import { useSessionOnly } from "../useSavedState";
import type { Bookmark, PageId } from "../types";

const ITEMS = [
  { key: "overview", label: "学习总览", icon: <ApartmentOutlined aria-hidden="true" /> },
  { key: "lang", label: "语言基础", icon: <CodeOutlined aria-hidden="true" /> },
  { key: "mid", label: "中间件与容器", icon: <ClusterOutlined aria-hidden="true" /> },
  { key: "scene", label: "场景实战", icon: <DeploymentUnitOutlined aria-hidden="true" /> },
];

function scrollToTop(event: MouseEvent<HTMLAnchorElement>) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function Layout({
  page, bookmark, focusMode, onExitFocus, children,
}: {
  page: PageId;
  bookmark: Bookmark | null;
  focusMode: boolean;
  onExitFocus: () => void;
  children: ReactNode;
}) {
  const sessionOnly = useSessionOnly();
  return (
    <div className={`app-shell${focusMode ? " app-shell--focus" : ""}`}>
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus(); }}>跳到主要内容</a>
      {!focusMode && (
        <aside className="app-sidebar">
          <a className="app-brand" href="#/overview" onClick={scrollToTop} aria-label="DevOps 面试研习室首页">
            <span className="brand-mark" aria-hidden="true"><DeploymentUnitOutlined aria-hidden="true" /></span>
            <span><strong>DevOps<span className="brand-period">.</span></strong><small>INTERVIEW STUDIO</small></span>
          </a>
          <p className="eyebrow sidebar-caption">WORKSPACE</p>
          <nav className="sidebar-nav" aria-label="主导航">
            {ITEMS.map((item) => (
              <a key={item.key} href={`#/${item.key}`} onClick={scrollToTop} aria-current={page === item.key ? "page" : undefined}>
                {item.icon}<span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="programme-note">
              <p className="eyebrow">MY PRACTICE</p>
              <p className="programme-title">把知识，<br />讲成经验。</p>
              <p>从一个知识点开始，<br />构建你的技术表达。</p>
              <a href="#/overview/plan/5d">查看冲刺计划 <ArrowUpOutlined aria-hidden="true" rotate={45} /></a>
            </div>
            <div className="sidebar-profile">
              <span className="profile-avatar">D</span>
              <span><strong>个人学习空间</strong><small>{sessionOnly ? "本次会话暂存" : "本机保存 · 随时继续"}</small></span>
              <span className="status-dot" aria-hidden="true" />
            </div>
          </div>
        </aside>
      )}
      <div className="app-workspace">
        <header className="app-header">
          <div className="header-breadcrumb"><span>面试研习室</span><span aria-hidden="true">/</span><strong>{focusMode ? "专注口述" : ITEMS.find((item) => item.key === page)?.label}</strong></div>
          {focusMode ? (
            <button type="button" className="quiet-button" onClick={onExitFocus} aria-label="退出专注练习"><CloseOutlined aria-hidden="true" /> 退出专注 <kbd>Esc</kbd></button>
          ) : (
            <span className="save-status" role="status" title={sessionOnly ? "浏览器存储暂不可用，刷新或关闭页面后可能丢失本次进度。" : bookmark?.label}><CheckCircleOutlined aria-hidden="true" /> {sessionOnly ? "本次会话暂存" : bookmark ? "阅读位置已保存" : "从这里开始"}</span>
          )}
        </header>
        <main id="main-content" className="page-content" tabIndex={-1}>{children}</main>
        {!focusMode && <footer className="app-footer"><span className="footer-brand">DevOps.</span><span>一点积累，一次更从容的表达。</span><span className="eyebrow">PERSONAL STUDY STUDIO</span></footer>}
      </div>
    </div>
  );
}
