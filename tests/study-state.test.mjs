import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { createServer } from "vite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Use the application's own TS loader; no browser or test-only dependencies.
// Never let the test loader invalidate the live dev server's dependency cache.
const cacheDir = await mkdtemp(join(tmpdir(), "devops-study-tests-"));
const vite = await createServer({
  cacheDir,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: "custom",
});
after(async () => {
  await vite.close();
  await rm(cacheDir, { recursive: true, force: true });
});
const [bookmarks, preferences, routing, study, storage, diagrams] = await Promise.all([
  vite.ssrLoadModule("/src/bookmark.ts"),
  vite.ssrLoadModule("/src/uiPrefs.ts"),
  vite.ssrLoadModule("/src/routing.ts"),
  vite.ssrLoadModule("/src/study.ts"),
  vite.ssrLoadModule("/src/storage.ts"),
  vite.ssrLoadModule("/src/components/diagrams/renderMermaid.ts"),
]);

const values = new Map();
let denied = false;
const browserEvents = new EventTarget();
globalThis.window = browserEvents;
globalThis.localStorage = {
  getItem(key) {
    if (denied) throw new Error("SecurityError");
    return values.get(key) ?? null;
  },
  setItem(key, value) {
    if (denied) throw new Error("QuotaExceededError");
    values.set(key, value);
  },
};
beforeEach(() => {
  denied = false;
  // Flush any pending writes from a failure test, then start a fresh session.
  for (const key of [bookmarks.BOOKMARK_KEY, preferences.UI_PREFS_KEY]) {
    storage.writeStorage(key, "null");
  }
  values.clear();
});

const bookmark = (page, primary, topic, updatedAt = "2026-11-08 12:00:00.000") => ({
  page, primary, topic, label: `${page}/${primary}/${topic}`, updatedAt,
});
const storeWith = (...items) => ({
  version: 2,
  current: items.at(-1),
  byPage: Object.fromEntries(items.map((item) => [item.page, item])),
});
const language = bookmark("lang", "go", "chan");
const middleLayer = study.studyLayers.find((layer) => layer.id === "mid");
const middleGroup = middleLayer.groups[0];
const middle = bookmark("mid", middleGroup.id, middleGroup.defaultTopic);

test("v1 bookmarks migrate without losing the reading location", () => {
  const { updatedAt: _, ...legacy } = language;
  const result = bookmarks.migrateToV2(legacy);
  assert.equal(result.version, 2);
  assert.equal(result.current.topic, "chan");
  assert.equal(result.current.updatedAt, "迁移");
  assert.deepEqual(result.byPage.lang, result.current);
});

test("v2 discards mismatched page slots and keeps current authoritative", () => {
  const result = bookmarks.migrateToV2({
    version: 2, current: language,
    byPage: { lang: { ...language, topic: "gmp" }, mid: language, bogus: middle },
  });
  assert.deepEqual(result.byPage, { lang: language });
});

test("a damaged current bookmark preserves valid per-page history", () => {
  const result = bookmarks.migrateToV2({ version: 2, current: {}, byPage: { mid: middle } });
  assert.deepEqual(result.current, middle);
});

test("corrupt JSON and unknown bookmark schemas safely fall back", () => {
  for (const raw of ["{", "null", "[]", JSON.stringify({ ...language, version: 9 })]) {
    assert.equal(bookmarks.readStore(raw), null);
  }
});

test("switching pages preserves each layer's reading location", () => {
  bookmarks.writeBookmark(language);
  bookmarks.writeBookmark(middle);
  bookmarks.writeBookmark(bookmark("overview", "home", "start"));
  assert.deepEqual(bookmarks.readPageBookmark("lang"), language);
  assert.deepEqual(bookmarks.readPageBookmark("mid"), middle);
  assert.equal(bookmarks.readBookmark().page, "overview");
});

test("preferences sanitize malformed values and duplicate visits", () => {
  const prefs = preferences.readUiPrefs(JSON.stringify({
    focusMode: "false", diagramExpanded: true, diagramTab: "unknown",
    overviewPlan: "2d", visitedByPage: { lang: ["gmp", null, 12, "gmp"], unknown: ["x"] },
  }));
  assert.deepEqual(prefs, { diagramExpanded: true, visitedByPage: { lang: ["gmp"] } });
  assert.deepEqual(preferences.readUiPrefs("null"), {});
  assert.deepEqual(preferences.readUiPrefs("{"), {});
});

test("revisiting cards does not inflate progress or overwrite other settings", () => {
  preferences.writeUiPrefs({ focusMode: true, overviewPlan: "3d" });
  preferences.markCardVisited("lang", "gmp");
  preferences.markCardVisited("mid", middle.topic);
  preferences.markCardVisited("lang", "gmp");
  preferences.markCardVisited("lang", "chan");
  assert.deepEqual(preferences.readUiPrefs(), {
    focusMode: true, overviewPlan: "3d",
    visitedByPage: { lang: ["gmp", "chan"], mid: [middle.topic] },
  });
});

test("language preference validates input and preserves learning state across switches", () => {
  assert.equal(preferences.readUiPrefs().locale, undefined);
  for (const locale of [null, "de", true, 1]) assert.equal(preferences.readUiPrefs(JSON.stringify({ locale })).locale, undefined);
  for (const locale of ["zh", "en"]) assert.equal(preferences.readUiPrefs(JSON.stringify({ locale })).locale, locale);
  bookmarks.writeBookmark(language);
  preferences.writeUiPrefs({ focusMode: true, diagramExpanded: true, diagramTab: "flow", overviewPlan: "3d", overviewStar: "bili" });
  preferences.markCardVisited("lang", "chan");
  const before = preferences.readUiPrefs();
  for (const locale of ["en", "zh", "en"]) {
    preferences.writeUiPrefs({ locale });
    assert.deepEqual(preferences.readUiPrefs(), { ...before, locale });
    assert.deepEqual(bookmarks.readBookmark(), language);
    const snapshot = study.readStudySnapshot();
    assert.equal(snapshot.resume.href, "#/lang/go/chan");
    assert.equal(snapshot.visited, 1);
    assert.equal(snapshot.total, 152);
    if (locale === "en") assert.doesNotMatch(snapshot.resume.layer + snapshot.resume.card.label, /\p{Script=Han}/u);
  }
});

test("language switches still work when persistent storage is unavailable", () => {
  denied = true;
  preferences.writeUiPrefs({ locale: "en", focusMode: true });
  assert.equal(preferences.readUiPrefs().locale, "en");
  preferences.markCardVisited("lang", "gmp");
  preferences.writeUiPrefs({ locale: "zh" });
  assert.deepEqual(preferences.readUiPrefs(), { locale: "zh", focusMode: true, visitedByPage: { lang: ["gmp"] } });
});

test("blocked storage keeps bookmarks and progress usable for this session", () => {
  denied = true;
  assert.equal(bookmarks.writeBookmark(language), false);
  assert.equal(preferences.writeUiPrefs({ overviewPlan: "3d" }), false);
  preferences.markCardVisited("lang", "chan");
  assert.equal(storage.hasUnsavedChanges(), true);
  assert.deepEqual(bookmarks.readBookmark(), language);
  assert.deepEqual(preferences.readVisitedForPage("lang"), ["chan"]);
  assert.equal(preferences.readUiPrefs().overviewPlan, "3d");
  assert.equal(study.readStudySnapshot().visited, 1);
});

test("failed writes override older disk values until a successful retry", () => {
  preferences.writeUiPrefs({ overviewPlan: "5d" });
  denied = true;
  preferences.writeUiPrefs({ overviewPlan: "3d" });
  denied = false;
  assert.equal(preferences.readUiPrefs().overviewPlan, "3d");
  assert.equal(preferences.writeUiPrefs({ focusMode: true }), true);
  assert.equal(storage.hasUnsavedChanges(), false);
  assert.deepEqual(JSON.parse(values.get(preferences.UI_PREFS_KEY)), { overviewPlan: "3d", focusMode: true });
});

test("cached reads survive a browser storage read failure", () => {
  bookmarks.writeBookmark(language);
  denied = true;
  assert.deepEqual(bookmarks.readBookmark(), language);
});

test("subscribers receive same-tab changes and relevant cross-tab events", () => {
  let notifications = 0;
  const stop = storage.subscribeStorage(() => notifications++);
  preferences.writeUiPrefs({ overviewPlan: "3d" });
  const change = (key) => {
    const event = new Event("storage");
    Object.defineProperty(event, "key", { value: key });
    browserEvents.dispatchEvent(event);
  };
  change("unrelated-key");
  change(preferences.UI_PREFS_KEY);
  change(null);
  assert.equal(notifications, 3);
  stop();
  change(bookmarks.BOOKMARK_KEY);
  assert.equal(notifications, 3);
});

test("first visit starts at the overview; returning visitors resume", () => {
  assert.deepEqual(routing.resolveRoute("", null, {}), { page: "overview", primary: "home", topic: "start" });
  assert.deepEqual(routing.resolveRoute("", storeWith(language), {}), { page: "lang", primary: "go", topic: "chan" });
});

test("an explicit overview link opens home instead of the saved subsection", () => {
  const saved = storeWith(bookmark("overview", "plan", "3d"));
  assert.deepEqual(routing.resolveRoute("#/overview", saved, {}), { page: "overview", primary: "home", topic: "start" });
});

test("partial overview links never borrow another subsection's topic", () => {
  const saved = storeWith(bookmark("overview", "plan", "3d"));
  assert.deepEqual(routing.resolveRoute("#/overview/star", saved, { overviewStar: "bili" }), {
    page: "overview", primary: "star", topic: "bili",
  });
  assert.deepEqual(routing.resolveRoute("#/overview/plan", storeWith(bookmark("overview", "home", "start")), { overviewPlan: "3d" }), {
    page: "overview", primary: "plan", topic: "3d",
  });
});

test("project and sprint selections remain independent across navigation", () => {
  preferences.writeUiPrefs({ overviewPlan: "3d" });
  preferences.writeUiPrefs({ overviewStar: "bili" });
  bookmarks.writeBookmark(bookmark("overview", "map", "start"));
  assert.deepEqual(routing.overviewSelection(preferences.readUiPrefs()), { star: "bili", plan: "3d" });
  assert.equal(routing.resolveRoute("#/overview/plan").topic, "3d");
  assert.equal(routing.resolveRoute("#/overview/star").topic, "bili");
});

test("explicit valid deep links override remembered selections", () => {
  assert.equal(routing.resolveRoute("#/overview/plan/5d", null, { overviewPlan: "3d" }).topic, "5d");
  assert.equal(routing.resolveRoute("#/overview/star/mingfu", null, { overviewStar: "bili" }).topic, "mingfu");
  assert.equal(routing.resolveRoute("#/lang/go/gmp", storeWith(language), {}).topic, "gmp");
});

test("bare layer links resume that layer while explicit groups use their own default", () => {
  const saved = storeWith(language, middle);
  assert.deepEqual(routing.resolveRoute("#/lang", saved, {}), { page: "lang", primary: "go", topic: "chan" });
  const group = study.studyLayers[0].groups[1];
  assert.deepEqual(routing.resolveRoute(`#/lang/${group.id}`, saved, {}), {
    page: "lang", primary: group.id, topic: group.defaultTopic,
  });
});

test("invalid route identifiers normalize to real content before persistence", () => {
  assert.deepEqual(routing.resolveRoute("#/lang/missing/ghost", null, {}), { page: "lang", primary: "go", topic: "gmp" });
  assert.deepEqual(routing.resolveRoute("#/overview/missing/ghost", null, {}), { page: "overview", primary: "home", topic: "start" });
  assert.equal(routing.resolveRoute("#/overview/star/ghost", null, { overviewStar: "also-missing" }).topic, "mingfu");
  assert.equal(routing.resolveRoute("#/overview/plan/ghost", null, { overviewPlan: "3d" }).topic, "3d");
});

test("course groups resolve to their own defaults and support direct topic links", () => {
  const saved = storeWith(language, middle);
  const courses = [
    ["lang", "shell", "expansion", "exit-status"],
    ["mid", "mysql", "innodb", "basic"],
    ["mid", "postgres", "pg-mvcc", "pg-query-plan"],
    ["mid", "linux", "linux-performance", "linux-services"],
    ["mid", "elk", "ingestion", "indexing"],
    ["mid", "prometheus", "scrape", "promql"],
    ["mid", "gitlab-ci", "gitlab-pipeline", "runners"],
    ["mid", "jenkins-ci", "jenkins-pipeline", "agents"],
    ["scene", "api", "api-http", "api-security"],
  ];
  for (const [page, primary, first, second] of courses) {
    assert.deepEqual(routing.resolveRoute(`#/${page}/${primary}`, saved, {}), { page, primary, topic: first });
    assert.deepEqual(routing.resolveRoute(`#/${page}/${primary}/${second}`, saved, {}), { page, primary, topic: second });
  }
});

test("role paths localize the same valid topics and preserve old MySQL bookmarks", () => {
  const legacy = bookmark("mid", "mysql", "basic");
  const saved = storeWith(legacy);
  const zh = study.readStudySnapshot(saved, { locale: "zh" });
  const en = study.readStudySnapshot(saved, { locale: "en" });
  assert.equal(zh.rolePaths.length, 3);
  assert.deepEqual(zh.rolePaths.map(({ topics }) => topics.map(({ href }) => href)),
    en.rolePaths.map(({ topics }) => topics.map(({ href }) => href)));
  for (const { title, topics } of en.rolePaths) {
    assert.doesNotMatch(title, /\p{Script=Han}/u);
    assert.equal(topics.length, 5);
    for (const { label, href } of topics) {
      assert.ok(label.trim());
      assert.doesNotMatch(label, /\p{Script=Han}/u);
      assert.deepEqual(routing.resolveRoute(href, saved, {}), bookmarks.parseHash(href));
    }
  }
  assert.equal(zh.resume.href, "#/mid/mysql/basic");
  assert.equal(en.resume.href, zh.resume.href);
});

test("progress counts only distinct cards that still exist in the curriculum", () => {
  const snapshot = study.readStudySnapshot(null, { visitedByPage: { lang: ["gmp", "gmp", "exit-status", "removed-card"], mid: [middle.topic, "gitlab-pipeline"] } });
  assert.deepEqual(snapshot.layers.map(({ total }) => total), [45, 70, 37]);
  assert.equal(snapshot.total, 152);
  assert.deepEqual(snapshot.layers.map(({ visited }) => visited), [2, 2, 0]);
  assert.equal(snapshot.visited, 4);
});

test("overview resumes the latest valid layer rather than itself or a stale card", () => {
  const old = { ...language, updatedAt: "2026-11-06 12:00:00.000" };
  const recent = { ...middle, updatedAt: "2026-11-07 12:00:00.000" };
  const saved = storeWith(old, recent, bookmark("scene", "removed", "ghost"), bookmark("overview", "home", "start"));
  const snapshot = study.readStudySnapshot(saved, {});
  assert.equal(snapshot.resume.href, `#/mid/${middle.primary}/${middle.topic}`);
  assert.equal(snapshot.resume.hasBookmark, true);
  assert.equal(study.readStudySnapshot(null, {}).resume.hasBookmark, false);
});

test("every curriculum group has a valid default and unambiguous card identifiers", () => {
  for (const layer of study.studyLayers) {
    const ids = layer.groups.flatMap((group) => group.cards.map((card) => card.id));
    assert.equal(new Set(ids).size, ids.length, `${layer.id}: duplicate card ids corrupt reading counts`);
    for (const group of layer.groups) {
      assert.ok(group.cards.some((card) => card.id === group.defaultTopic), `${layer.id}/${group.id}: invalid default`);
    }
  }
});

test("diagram renders isolate temporary DOM and clean up after success and engine failure", async () => {
  const originalDocument = globalThis.document;
  const attached = new Set();
  globalThis.document = {
    createElement() {
      return { style: {}, setAttribute() {}, remove() { attached.delete(this); } };
    },
    body: { appendChild(element) { attached.add(element); } },
  };
  try {
    const failure = new Error("Failed to fetch dynamically imported module");
    let finishValid;
    let failInvalid;
    const containers = [];
    const engine = {
      initialize(config) { assert.equal(config.suppressErrorRendering, true); },
      render(id, source, container) {
        assert.ok(attached.has(container), "measurement needs an attached container");
        assert.equal(source, "sequenceDiagram");
        containers.push(container);
        return new Promise((resolve, reject) => {
          if (id === "valid") finishValid = resolve;
          else failInvalid = reject;
        });
      },
    };
    const valid = diagrams.renderMermaid(engine, "valid", " sequenceDiagram ");
    const invalid = diagrams.renderMermaid(engine, "invalid", "sequenceDiagram");
    assert.equal(attached.size, 2);
    assert.notEqual(containers[0], containers[1]);
    failInvalid(failure);
    await assert.rejects(invalid, (error) => error === failure);
    assert.equal(attached.size, 1, "failed render must not remove another in-flight render");
    finishValid({ svg: "<svg></svg>" });
    assert.deepEqual(await valid, { svg: "<svg></svg>" });
    assert.equal(attached.size, 0);
    await assert.rejects(diagrams.renderMermaid({ ...engine, render() { throw failure; } }, "sync", "sequenceDiagram"));
    assert.equal(attached.size, 0, "synchronous throws also clean up");
  } finally {
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
});
