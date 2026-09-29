import { QueryClient } from '@tanstack/react-query';
import { isRetryable, type ApiError } from '@/shared/lib/errors';

declare module '@tanstack/react-query' {
  // Query functions only throw ApiError (the API layer guarantees it), so errors are typed everywhere.
  interface Register {
    defaultError: ApiError;
  }
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => failureCount < 2 && isRetryable(error.error),
      },
      mutations: { retry: false },
    },
  });
}
