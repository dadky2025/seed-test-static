import { z } from 'zod';
import { apiFetch } from '@/shared/lib/http/client';
import { sortByRecent, type Item } from '../model/items';
import { ItemDtoSchema, toItem } from './items.dto';

export async function fetchItems(signal?: AbortSignal): Promise<Item[]> {
  const dtos = await apiFetch('items/items', z.array(ItemDtoSchema), { signal });
  return sortByRecent(dtos.map(toItem));
}

export async function fetchItem(id: string, signal?: AbortSignal): Promise<Item> {
  const dto = await apiFetch(`items/items/${encodeURIComponent(id)}`, ItemDtoSchema, { signal });
  return toItem(dto);
}
