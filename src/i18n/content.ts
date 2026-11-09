import { languageGroups, languageIntro } from '../data/language';
import { middlewareGroups, middlewareIntro } from '../data/middleware';
import { scenarioGroups, scenarioIntro } from '../data/scenarios';
import { shell } from '../data/shell';
import { elk, prometheus } from '../data/observability';
import { gitlab, jenkins } from '../data/delivery';
import * as overviewZh from '../data/overview';
import * as overviewEn from './overview.en';
import { languageEnglish } from './language.en';
import { pythonEnglish } from './python.en';
import { middlewareEnglish } from './middleware.en';
import { scenarioEnglish } from './scenario.en';
import { localizeVisual } from './visuals';
import type { SegmentGroup } from '../types';
import type { LayerPageId } from '../uiPrefs';
import type { Locale } from './ui';

export const englishCards = {
  ...languageEnglish, ...pythonEnglish, ...shell.english, ...middlewareEnglish,
  ...elk.english, ...prometheus.english, ...gitlab.english, ...jenkins.english, ...scenarioEnglish,
};
const groupLabels: Record<string, string> = {
  go: 'Golang', python: 'Python', shell: 'Shell', mysql: 'MySQL', mongo: 'MongoDB', redis: 'Redis', mq: 'Messaging',
  container: 'Containers / Kubernetes', net: 'DNS / TLS', elk: 'ELK', prometheus: 'Prometheus',
  'gitlab-ci': 'GitLab CI/CD', 'jenkins-ci': 'Jenkins CI', cicd: 'CI/CD', monitor: 'Monitoring',
  log: 'Logs / Tracing', ops: 'Platform engineering', cmdb: 'CMDB / Consistency', report: 'Reporting', other: 'Operations',
};
const chineseGroups: Record<LayerPageId, SegmentGroup[]> = { lang: languageGroups, mid: middlewareGroups, scene: scenarioGroups };
function translateGroups(groups: SegmentGroup[]): SegmentGroup[] {
  return groups.map(group => ({
    ...group, label: groupLabels[group.id],
    cards: group.cards.map(card => {
      const copy = englishCards[`${group.id}/${card.id}`];
      if (!copy) throw new Error(`Missing English content: ${group.id}/${card.id}`);
      return { ...card, ...copy, visuals: card.visuals?.map(localizeVisual) };
    }),
  }));
}
const englishGroups: Record<LayerPageId, SegmentGroup[]> = {
  lang: translateGroups(languageGroups), mid: translateGroups(middlewareGroups), scene: translateGroups(scenarioGroups),
};
export function localizedGroups(page: LayerPageId, locale: Locale): SegmentGroup[] {
  return (locale === 'zh' ? chineseGroups : englishGroups)[page];
}
const intros = {
  zh: { lang: languageIntro, mid: middlewareIntro, scene: scenarioIntro },
  en: {
    lang: 'Go, Python and Shell are parallel learning paths. Understand language and runtime semantics before discussing services, concurrency, platform authorization and script automation. Check the official documentation for version-specific behavior and portability limits. Use these answers to organize your explanation and base any project claims on your actual implementation.',
    mid: 'Understand infrastructure constraints across storage and consistency, caching, messaging, container orchestration, DNS/TLS, logging and monitoring, and continuous integration and delivery. Explain the mechanism, failure conditions, trade-offs and verification. Specific guarantees depend on versions, configuration and deployment.',
    scene: 'Apply language and infrastructure knowledge to delivery, observability, platforms and consistency. Explain objectives, constraints, recovery and verification. Technical guidance does not establish personal project experience; claimed results require verifiable records.',
  },
};
export function localizedIntro(page: LayerPageId, locale: Locale): string { return intros[locale][page]; }
export function localizedOverview(locale: Locale) { return locale === 'zh' ? overviewZh : overviewEn; }
