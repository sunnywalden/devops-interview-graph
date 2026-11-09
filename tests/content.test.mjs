import assert from "node:assert/strict";
import { after, test } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";

const cacheDir = await mkdtemp(join(tmpdir(), "devops-content-tests-"));
const vite = await createServer({
  cacheDir,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false, watch: null },
  appType: "custom",
});
after(async () => {
  await vite.close();
  await rm(cacheDir, { recursive: true, force: true });
});
const [{ studyLayers }, { contentSources }, { starStories }] = await Promise.all([
  vite.ssrLoadModule("/src/study.ts"),
  vite.ssrLoadModule("/src/data/sources.ts"),
  vite.ssrLoadModule("/src/data/overview.ts"),
]);
const entries = studyLayers.flatMap((layer) => layer.groups.flatMap((group) =>
  group.cards.map((card) => ({ route: `${layer.id}/${group.id}/${card.id}`, card })),
));

test("the content revision preserves all existing deep links and reading identifiers", async () => {
  const previousRoutes = JSON.parse(await readFile(new URL("./fixtures/curriculum-routes.json", import.meta.url), "utf8"));
  const routes = entries.map(({ route }) => route);
  assert.equal(new Set(routes).size, routes.length);
  for (const route of previousRoutes) assert.ok(routes.includes(route), `Missing existing route: ${route}`);
});

test("every answer has complete study material and resolvable primary references", () => {
  for (const { route, card } of entries) {
    for (const field of ["label", "oneLiner", "oral", "resumeAnchor"]) {
      assert.ok(card[field]?.trim(), `${route}: missing ${field}`);
    }
    for (const field of ["principles", "pitfalls"]) {
      assert.ok(card[field]?.length, `${route}: missing ${field}`);
      assert.ok(card[field].every((text) => text.trim()), `${route}: blank ${field}`);
    }
    assert.equal(card.followUps.length, 5, `${route}: expected five follow-up questions`);
    assert.equal(new Set(card.followUps.map(({ q }) => q)).size, card.followUps.length, `${route}: duplicate questions`);
    assert.ok(card.followUps.every(({ q, a }) => q.trim() && a.trim()), `${route}: incomplete Q&A`);
    assert.ok(card.sources.length, `${route}: no references`);
    assert.equal(new Set(card.sources).size, card.sources.length, `${route}: duplicate references`);
    for (const id of card.sources) {
      assert.ok(contentSources[id], `${route}: unknown reference ${id}`);
    }
  }
  for (const [id, source] of Object.entries(contentSources)) {
    assert.ok(source.title.trim(), `${id}: missing reference title`);
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:", `${id}: reference must use HTTPS`);
    assert.equal(url.username + url.password, "", `${id}: reference must not embed credentials`);
  }
});

test("interactive diagrams have unique nodes and connected edge endpoints", () => {
  for (const { route, card } of entries) {
    for (const visual of card.visuals ?? []) {
      assert.ok(visual.title.trim(), `${route}: missing diagram title`);
      if (visual.kind === "mermaid") {
        assert.ok(visual.source.trim(), `${route}: empty Mermaid source`);
        continue; // Real SVG rendering is covered by mermaid-browser.html.
      }
      const nodes = new Set(visual.nodes.map(({ id }) => id));
      assert.equal(nodes.size, visual.nodes.length, `${route}: duplicate diagram nodes`);
      for (const edge of visual.edges) {
        assert.ok(nodes.has(edge.from) && nodes.has(edge.to), `${route}: edge references a missing node`);
      }
    }
  }
});

test("project practice stories expose their evidence status separately from reference answers", () => {
  for (const story of starStories) {
    assert.ok(story.evidence?.trim(), `${story.id}: missing evidence status`);
    for (const field of ["s", "t", "a", "r", "followUp"]) {
      assert.ok(story[field]?.trim(), `${story.id}: missing ${field}`);
    }
  }
});
