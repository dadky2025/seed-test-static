import type { AppError } from './errors';

/** Every state a data screen can be in. Impossible combinations (loading + error) cannot be built. */
export type ScreenState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'empty' }
  | { status: 'content'; data: T };
