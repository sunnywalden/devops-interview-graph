import type { CardCopy } from "../i18n/contentTypes";
import type { SegmentGroup } from "../types";
import type { ContentSourceId } from "./sources";

type BilingualTopic = {
  sources: ContentSourceId[];
  zh: CardCopy;
  en: CardCopy;
};

export function bilingualTopics(id: string, topics: Record<string, BilingualTopic>) {
  const cards: SegmentGroup["cards"] = Object.entries(topics)
    .map(([topic, { sources, zh }]) => ({ id: topic, sources, ...zh }));
  const english: Record<string, CardCopy> = Object.fromEntries(
    Object.entries(topics).map(([topic, { en }]) => [`${id}/${topic}`, en]),
  );
  return { cards, english };
}

export function bilingualGroup(
  id: string,
  label: string,
  defaultTopic: string,
  topics: Record<string, BilingualTopic>,
) {
  const { cards, english } = bilingualTopics(id, topics);
  const group: SegmentGroup = { id, label, defaultTopic, cards };
  return { group, english };
}
