import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { env } from '@/shared/config/env';
import { ApiError } from '@/shared/lib/errors';
import { server } from '@/test/msw/server';
import { fetchItem, fetchItems } from './items.api';
import fixtures from './items.fixtures.json';

const url = (path: string) => new URL(path, env.apiBaseUrl).href;

async function errorOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (cause) {
    if (cause instanceof ApiError) return cause.error;
    throw cause;
  }
  throw new Error('expected the call to fail');
}

describe('items api', () => {
  it('maps DTOs to items, most recent first', async () => {
    const items = await fetchItems();
    expect(items).toHaveLength(fixtures.length);
    expect(items[0]?.id).toBe('books');
    expect(items[0]?.updatedAt).toBeInstanceOf(Date);
  });

  it('maps one DTO to an item', async () => {
    const item = await fetchItem('coffee');
    expect(item).toEqual({
      id: 'coffee',
      title: 'Coffee beans',
      updatedAt: new Date('2026-09-20T09:30:00Z'),
    });
  });

  it('turns a 500 into a server error', async () => {
    server.use(http.get(url('items/items'), () => new HttpResponse(null, { status: 500 })));
    expect(await errorOf(fetchItems())).toEqual({ kind: 'server', status: 500 });
  });

  it('turns a 404 into notFound', async () => {
    expect(await errorOf(fetchItem('missing'))).toEqual({ kind: 'notFound' });
  });

  it('turns a malformed payload into a validation error', async () => {
    server.use(http.get(url('items/items'), () => HttpResponse.json([{ id: 1 }])));
    const error = await errorOf(fetchItems());
    expect(error.kind).toBe('validation');
  });
});
