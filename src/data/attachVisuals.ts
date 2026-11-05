import type { CardVisual, SegmentGroup } from "../types";

/** Key format: `${groupId}/${cardId}` */
export function attachVisuals(
  groups: SegmentGroup[],
  visuals: Record<string, CardVisual[]>,
): SegmentGroup[] {
  return groups.map((g) => ({
    ...g,
    cards: g.cards.map((c) => {
      const v = visuals[`${g.id}/${c.id}`];
      return v?.length ? { ...c, visuals: v } : c;
    }),
  }));
}
