import type { ZodType } from 'zod';
import { env } from '@/shared/config/env';
import { ApiError, type AppError } from '@/shared/lib/errors';

const TIMEOUT_MS = 15_000;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Cancellation from the caller (TanStack Query, a loader's request.signal, an unmount). */
  signal?: AbortSignal;
}

/**
 * Calls the API and returns the body parsed by `schema`. Throws ApiError for every expected failure;
 * rethrows the caller's own cancellation untouched, because a cancelled request is not an error.
 */
export async function apiFetch<T>(
  path: string,
  schema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  const hasBody = options.body !== undefined;

  let response: Response;
  try {
    response = await fetch(new URL(path, env.apiBaseUrl), {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal,
    });
  } catch (cause) {
    if (options.signal?.aborted) throw cause;
    throw new ApiError(timeout.aborted ? { kind: 'timeout' } : { kind: 'network' }, { cause });
  }

  if (!response.ok) throw new ApiError(fromStatus(response.status));

  const body: unknown = response.status === 204 ? undefined : await response.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // The backend broke its contract: surface it as a typed error, never as a crash in a component.
    throw new ApiError(
      { kind: 'validation', issues: parsed.error.issues.map((issue) => issue.message) },
      { cause: parsed.error },
    );
  }
  return parsed.data;
}

function fromStatus(status: number): AppError {
  switch (status) {
    case 401:
      return { kind: 'unauthorized' };
    case 403:
      return { kind: 'forbidden' };
    case 404:
      return { kind: 'notFound' };
    default:
      return { kind: 'server', status };
  }
}
