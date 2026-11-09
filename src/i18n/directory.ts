export type DirectoryItem = {
  id: string;
  label: string;
  searchLabels?: readonly string[];
};

/** Search both languages while displaying only the selected language. */
export function bilingualDirectory(current: DirectoryItem[], alternate: DirectoryItem[]): DirectoryItem[] {
  const aliases = new Map(alternate.map(item => [item.id, item.label]));
  return current.map(({ id, label }) => ({
    id,
    label,
    searchLabels: [label, aliases.get(id) ?? label],
  }));
}

export function filterDirectory<T extends DirectoryItem>(items: T[], query: string): T[] {
  const normalize = (value: string) => value.normalize('NFKC').toLowerCase();
  const needle = normalize(query.trim());
  return needle
    ? items.filter(item => [item.label, ...(item.searchLabels ?? [])].some(label => normalize(label).includes(needle)))
    : items;
}
