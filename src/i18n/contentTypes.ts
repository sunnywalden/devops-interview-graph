import type { Card } from '../types';

export type CardCopy = Omit<Card, 'id' | 'sources' | 'visuals'>;
/** Field order follows the learning card: summary, project connection, explanation, notes, questions. */
export function card(label: string, oneLiner: string, resumeAnchor: string, oral: string, principles: string[], pitfalls: string[], questions: [string, string][], extra: Pick<CardCopy, 'scope' | 'warning'> = {}): CardCopy {
  return { label, oneLiner, resumeAnchor, oral, principles, pitfalls, followUps: questions.map(([q, a]) => ({ q, a })), ...extra };
}
