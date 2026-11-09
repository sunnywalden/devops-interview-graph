import { useLocale } from "../i18n/useLocale";
import { lazy, Suspense } from "react";
import { Segmented, Spin, Tabs } from "antd";
import { ArrowRightOutlined, ArrowUpOutlined, ClockCircleOutlined, FlagOutlined, ReadOutlined } from "@ant-design/icons";
import { localizedOverview } from "../i18n/content";
import { bilingualDirectory } from "../i18n/directory";
import { TopicPager } from "../components/TopicPager";
import { StudyIllustration } from "../components/StudyIllustration";
import { readStudySnapshot } from "../study";
import { useBookmarkStore, useUiPrefs } from "../useSavedState";

const OverviewFlow = lazy(() =>
  import("../components/diagrams/OverviewFlow").then((m) => ({ default: m.OverviewFlow })),
);

export function OverviewPage({
  section, star, plan, onSection, onStar, onPlan,
}: {
  section: string;
  star: string;
  plan: "5d" | "3d";
  onSection: (section: string) => void;
  onStar: (id: string) => void;
  onPlan: (id: "5d" | "3d") => void;
}) {
  const { t, locale } = useLocale();
  const { starStories, sprint5d, sprint3d, sprintTips, checklist, narrative } = localizedOverview(locale);
  const story = starStories.find((s) => s.id === star) ?? starStories[0];
  const { layers, rolePaths, total, visited, resume } = readStudySnapshot(useBookmarkStore(), useUiPrefs());
  const percent = total ? Math.round((visited / total) * 100) : 0;
  const days = plan === "5d" ? sprint5d : sprint3d;
  const activeTab = ["home", "star", "plan", "map"].includes(section) ? section : "home";

  return (
    <div className="overview-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">A LITTLE PRACTICE, EVERY DAY</p>
          <h1>{t("让每一次表达，")}<span>{t("更有底气。")}</span></h1>
          <p className="page-subtitle">{t("从上次停下的地方继续，每次专注一个知识点。")}</p>
        </div>
        <span className="edition-label"><span className="status-dot" /> PERSONAL EDITION</span>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="study-hero" aria-labelledby="continue-title">
            <div className="study-hero__body">
              <div className="study-hero__copy">
                <div className="hero-meta"><span className="hero-badge"><span /> {resume.hasBookmark ? t("接着上次学") : t("准备好开始")}</span><span className="eyebrow">{resume.group}</span></div>
                <p className="eyebrow hero-kicker">YOUR NEXT SESSION</p>
                <h2 id="continue-title">{resume.card.label}</h2>
                <p className="study-hero__description">{resume.card.oneLiner}</p>
                <a className="hero-cta" href={resume.href}>{resume.hasBookmark ? t("继续上次学习") : t("开始第一课")}<ArrowRightOutlined aria-hidden="true" /></a>
              </div>
              <StudyIllustration />
            </div>
            <div className="study-hero__footer"><span><ClockCircleOutlined aria-hidden="true" />{t("60–90 秒口述练习")}</span><span><ReadOutlined aria-hidden="true" /> {resume.layer} · {resume.group}</span></div>
          </section>

          <Tabs
            className="workspace-tabs"
            activeKey={activeTab}
            onChange={(key) => key === "star" ? onStar(star) : key === "plan" ? onPlan(plan) : onSection(key)}
            destroyOnHidden
            items={[
              {
                key: "home", label: t("学习路线"),
                children: (
                  <section className="paper-panel route-panel" aria-labelledby="route-title">
                    <header className="panel-heading"><div><p className="eyebrow">YOUR LEARNING PATH</p><h2 id="route-title">{t("由浅入深，连成体系。")}</h2></div><span className="subtle-pill">{t("3 个学习层级")}</span></header>
                    <nav className="course-list" aria-label={t("学习路线")}>
                      {layers.map((layer, index) => (
                        <a className="course-link" href={`#/${layer.id}`} key={layer.id}>
                          <span className="course-number">0{index + 1}</span>
                          <span className="course-copy"><strong>{layer.title}<span>{layer.subtitle}</span></strong><span>{layer.description}</span></span>
                          <span className="course-count">{layer.visited}<span> / {layer.total}</span><small>{t("已浏览")}</small></span>
                          <span className="course-arrow"><ArrowRightOutlined aria-hidden="true" /></span>
                        </a>
                      ))}
                    </nav>
                    <p className="panel-footnote"><ReadOutlined aria-hidden="true" />{t("每个知识点都有口述、追问和原理，按自己的节奏推进。")}</p>
                    <nav className="role-paths" aria-labelledby="role-paths-title">
                      <h3 id="role-paths-title">{t("按岗位开始学习")}</h3>
                      <p>{t("每条路线精选 5 个知识点，点击即可开始。")}</p>
                      <div className="role-paths-grid">
                        {rolePaths.map(({ id, title, topics }) => (
                          <div className="role-path" key={id}>
                            <h4>{title}</h4>
                            <ol>{topics.map(({ label, href }) => <li key={href}><a href={href}>{label}</a></li>)}</ol>
                          </div>
                        ))}
                      </div>
                    </nav>
                  </section>
                ),
              },
              {
                key: "star", label: t("项目表达"),
                children: (
                  <section className="paper-panel" aria-labelledby="star-title">
                    <header className="panel-heading"><div><p className="eyebrow">TELL YOUR STORY</p><h2 id="star-title">{t("把项目讲成一个好故事。")}</h2></div><span className="subtle-pill">{t("90 秒 · STAR")}</span></header>
                    <TopicPager items={bilingualDirectory(starStories, localizedOverview(locale === "zh" ? "en" : "zh").starStories)} value={story.id} onChange={onStar} ariaLabel={t("项目")} scopeLabel="STAR" />
                    <p className="story-evidence">{story.evidence}</p>
                    <div className="story-context"><p><span>{t("角色方向 · 待核实")}</span>{story.role}</p><p><span>{t("知识关联")}</span>{story.layerMap}</p></div>
                    <div className="star-steps">
                      {[{ key: "S", label: t("背景"), time: "20s", text: story.s }, { key: "T", label: t("任务"), time: "10s", text: story.t }, { key: "A", label: t("行动"), time: "40s", text: story.a }, { key: "R", label: t("结果"), time: "20s", text: story.r }].map((step) => (
                        <div className="star-step" key={step.key}><span className="star-letter">{step.key}</span><div><h3>{step.label}<small>{step.time}</small></h3><p>{step.text}</p></div></div>
                      ))}
                    </div>
                    <details key={story.id} className="story-followup"><summary>{t("练习追问")}<ArrowRightOutlined aria-hidden="true" /></summary><p>{story.followUp}</p></details>
                  </section>
                ),
              },
              {
                key: "plan", label: t("冲刺计划"),
                children: (
                  <section className="paper-panel" aria-labelledby="plan-title">
                    <header className="panel-heading"><div><p className="eyebrow">MAKE ROOM FOR PRACTICE</p><h2 id="plan-title">{t("给准备，一点节奏。")}</h2></div><Segmented value={plan} options={[{ value: "5d", label: t("5 天") }, { value: "3d", label: t("3 天") }]} onChange={(v) => onPlan(v as "5d" | "3d")} aria-label={t("冲刺计划")} /></header>
                    <div className="sprint-days">{days.map((day, index) => (
                      <article className="sprint-day" key={day.label}><span className="course-number">0{index + 1}</span><div><h3>{day.label}</h3>{day.items.map((item) => <p key={item.label}><strong>{item.label}</strong>{item.value}</p>)}</div></article>
                    ))}</div>
                    <details className="plan-notes"><summary>{t("准备清单与练习建议")}</summary><ul>{checklist.map((item) => <li key={item}>{item}</li>)}</ul><ul>{sprintTips.map((item) => <li key={item}>{item}</li>)}</ul></details>
                  </section>
                ),
              },
              {
                key: "map", label: t("知识图谱"),
                children: (
                  <section className="paper-panel" aria-labelledby="map-title">
                    <header className="panel-heading"><div><p className="eyebrow">CONNECT THE DOTS</p><h2 id="map-title">{t("看见知识之间的联系。")}</h2></div></header>
                    <p className="page-subtitle">{narrative}</p>
                    <div className="overview-flow-wrap"><Suspense fallback={<div className="diagram-loading"><Spin /><span>{t("加载交互图谱…")}</span></div>}><OverviewFlow /></Suspense></div>
                    <p className="panel-footnote">{t("语言 → 中间件与容器 → DevOps 场景。连线表示支撑与构建关系；可拖动平移、使用控件缩放。")}</p>
                  </section>
                ),
              },
            ]}
          />
        </div>

        <aside className="dashboard-aside" aria-label={t("学习概况")}>
          <section className="paper-panel progress-panel">
            <div className="panel-topline"><p className="eyebrow">AT YOUR OWN PACE</p><FlagOutlined aria-hidden="true" /></div>
            <h2>{t("一点一滴，都算数。")}</h2>
            <div className="progress-number">{visited}<span> / {total}</span></div>
            <div className="progress-track" role="progressbar" aria-label={t("知识点浏览进度")} aria-valuenow={visited} aria-valuemin={0} aria-valuemax={total}><span style={{ width: `${percent}%` }} /></div>
            <div className="progress-caption"><span>{t("已浏览知识点")}</span><span>{percent}%</span></div>
            <div className="layer-progress-list">{layers.map((layer) => <div key={layer.id}><span>{layer.title}</span><strong>{layer.visited}<span> / {layer.total}</span></strong></div>)}</div>
            <p className="progress-note">{t("记录阅读足迹，掌握程度由你判断。")}</p>
          </section>
          <section className="coach-note">
            <p className="eyebrow"><span /> A NOTE FOR YOU</p>
            <h2>{t("练习表达，也练习思考。")}</h2>
            <p>{t("选一个熟悉的知识点，试着不看答案讲一遍。再用追问，找出还没想透的地方。")}</p>
            <blockquote>{t("“先讲结论，再解释取舍。”")}</blockquote>
            <a href="#/overview/star/mingfu">{t("练习项目表达")}<ArrowUpOutlined aria-hidden="true" rotate={45} /></a>
          </section>
          <a className="sprint-shortcut" href="#/overview/plan/5d"><span><span className="eyebrow">A SMALL PLAN</span><strong>{t("面试前，安排一次冲刺。")}</strong><small>{t("3–5 天，串联知识与项目")}</small></span><ArrowRightOutlined aria-hidden="true" /></a>
        </aside>
      </div>
    </div>
  );
}
