import { z } from 'zod';
import type { Item } from '../model/items';

export const ItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  updated_at: z.iso.datetime({ offset: true }),
});

export type ItemDto = z.infer<typeof ItemDtoSchema>;

export function toItem(dto: ItemDto): Item {
  return { id: dto.id, title: dto.title, updatedAt: new Date(dto.updated_at) };
}
