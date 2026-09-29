import { useQuery } from '@tanstack/react-query';
import type { ScreenState } from '@/shared/lib/screen-state';
import { itemsDetailQuery } from '../api/items.queries';
import type { Item } from '../model/items';

export function useItemsDetail(id: string): { state: ScreenState<Item>; onRetry: () => void } {
  const query = useQuery(itemsDetailQuery(id));

  const state: ScreenState<Item> = query.isPending
    ? { status: 'loading' }
    : query.isError
      ? { status: 'error', error: query.error.error }
      : { status: 'content', data: query.data };

  return { state, onRetry: () => void query.refetch() };
}
