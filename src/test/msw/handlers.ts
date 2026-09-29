import { itemsHandlers } from '@/features/items/api/items.handlers';

/** Every feature's MSW handlers — the one place allowed to import them. */
export const handlers = [...itemsHandlers];
