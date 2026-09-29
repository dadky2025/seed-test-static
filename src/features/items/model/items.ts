import { z } from 'zod';

export const ItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  updatedAt: z.date(),
});

export type Item = z.infer<typeof ItemSchema>;

/** Most recently updated first; returns a new array. */
export function sortByRecent(items: readonly Item[]): Item[] {
  return items.toSorted((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
