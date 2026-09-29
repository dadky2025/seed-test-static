import { describe, expect, it } from 'vitest';
import { sortByRecent, type Item } from './items';

const item = (id: string, iso: string): Item => ({ id, title: id, updatedAt: new Date(iso) });

describe('sortByRecent', () => {
  it('orders the most recently updated item first', () => {
    const items = [item('a', '2026-01-01T00:00:00Z'), item('b', '2026-03-01T00:00:00Z')];
    expect(sortByRecent(items).map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('does not mutate its input', () => {
    const items = [item('a', '2026-01-01T00:00:00Z'), item('b', '2026-03-01T00:00:00Z')];
    sortByRecent(items);
    expect(items.map((i) => i.id)).toEqual(['a', 'b']);
  });
});
