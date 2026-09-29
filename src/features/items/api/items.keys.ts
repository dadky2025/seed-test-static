// items.keys.ts — every key for this feature, so reads and invalidations always agree.
export const itemsKeys = {
  all: ['items'] as const,
  list: () => [...itemsKeys.all, 'list'] as const,
  detail: (id: string) => [...itemsKeys.all, 'detail', id] as const,
};
