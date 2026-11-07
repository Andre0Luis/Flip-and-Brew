/** Põe o item em uso no começo da prateleira e mantém a ordem dos outros. */
export function equippedFirst<T extends { id: string }>(items: T[], equippedId: string): T[] {
  const i = items.findIndex((x) => x.id === equippedId);
  if (i <= 0) return items;
  return [items[i], ...items.slice(0, i), ...items.slice(i + 1)];
}
