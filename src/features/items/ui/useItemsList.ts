import { useQuery } from '@tanstack/react-query';
import type { ScreenState } from '@/shared/lib/screen-state';
import { itemsListQuery } from '../api/items.queries';
import type { Item } from '../model/items';

export function useItemsList(): { state: ScreenState<Item[]>; onRetry: () => void } {
  const query = useQuery(itemsListQuery());

  const state: ScreenState<Item[]> = query.isPending
    ? { status: 'loading' }
    : query.isError
      ? { status: 'error', error: query.error.error }
      : query.data.length === 0
        ? { status: 'empty' }
        : { status: 'content', data: query.data };

  return { state, onRetry: () => void query.refetch() };
}
