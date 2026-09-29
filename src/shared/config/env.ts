import { z } from 'zod';

const schema = z.object({
  // Must end with "/" so new URL('items', base) keeps the base path.
  API_BASE_URL: z.url().refine((url) => url.endsWith('/'), 'must end with "/"'),
  APP_VERSION: z.string().min(1).default('dev'),
});

const parsed = schema.safeParse({
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
});

if (!parsed.success) {
  // Fails at startup with every problem listed, instead of an undefined URL deep inside a request.
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env = {
  apiBaseUrl: parsed.data.API_BASE_URL,
  appVersion: parsed.data.APP_VERSION,
} as const;
