import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { env } from '@/shared/config/env';
import { server } from '@/test/msw/server';
import fixtures from '../api/items.fixtures.json';
import { useItemsDetail } from './useItemsDetail';
import { useItemsList } from './useItemsList';

const url = (path: string) => new URL(path, env.apiBaseUrl).href;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useItemsList', () => {
  it('goes from loading to content', async () => {
    const { result } = renderHook(() => useItemsList(), { wrapper });

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => {
      expect(result.current.state.status).toBe('content');
    });
    expect(result.current.state).toMatchObject({ data: { length: fixtures.length } });
  });

  it('reports empty when the API returns no items', async () => {
    server.use(http.get(url('items/items'), () => HttpResponse.json([])));
    const { result } = renderHook(() => useItemsList(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.status).toBe('empty');
    });
  });

  it('maps a failing request to an error state and refetches on retry', async () => {
    let calls = 0;
    server.use(
      http.get(url('items/items'), () => {
        calls += 1;
        return new HttpResponse(null, { status: 503 });
      }),
    );
    const { result } = renderHook(() => useItemsList(), { wrapper });

    await waitFor(() => {
      expect(result.current.state).toEqual({
        status: 'error',
        error: { kind: 'server', status: 503 },
      });
    });
    result.current.onRetry();
    await waitFor(() => {
      expect(calls).toBe(2);
    });
  });
});

describe('useItemsDetail', () => {
  it('loads one item and maps a 404 to notFound', async () => {
    const { result: found } = renderHook(() => useItemsDetail('coffee'), { wrapper });
    await waitFor(() => {
      expect(found.current.state.status).toBe('content');
    });

    const { result: missing } = renderHook(() => useItemsDetail('missing'), { wrapper });
    await waitFor(() => {
      expect(missing.current.state).toEqual({
        status: 'error',
        error: { kind: 'notFound' },
      });
    });
    missing.current.onRetry();
  });
});
