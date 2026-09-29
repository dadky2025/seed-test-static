import { queryOptions } from '@tanstack/react-query';
import { fetchItem, fetchItems } from './items.api';
import { itemsKeys } from './items.keys';

export const itemsListQuery = () =>
  queryOptions({ queryKey: itemsKeys.list(), queryFn: ({ signal }) => fetchItems(signal) });

export const itemsDetailQuery = (id: string) =>
  queryOptions({ queryKey: itemsKeys.detail(id), queryFn: ({ signal }) => fetchItem(id, signal) });
