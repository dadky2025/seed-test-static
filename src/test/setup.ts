import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import i18n, { DEFAULT_LOCALE } from '@/shared/i18n/i18n';
import { server } from './msw/server';

// jsdom has no layout: TanStack Router resets scroll on navigation and jsdom logs "Not implemented".
window.scrollTo = vi.fn();

beforeAll(async () => {
  // An unhandled request is a missing handler, not a network call: fail loudly.
  server.listen({ onUnhandledRequest: 'error' });
  // jsdom reports en-US; tests always read the default locale's catalog.
  await i18n.changeLanguage(DEFAULT_LOCALE);
});
afterEach(() => {
  server.resetHandlers();
  // Vitest runs without globals, so Testing Library cannot register this itself.
  cleanup();
});
afterAll(() => {
  server.close();
});
