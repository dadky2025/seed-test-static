export type AppError =
  | { kind: 'network' }
  | { kind: 'timeout' }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'notFound' }
  | { kind: 'validation'; issues: readonly string[] }
  | { kind: 'server'; status: number }
  | { kind: 'unknown' };

/** The only error type thrown by the API layer. Carries an AppError; `cause` keeps the original. */
export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly error: AppError;

  constructor(error: AppError, options?: ErrorOptions) {
    super(error.kind, options);
    this.error = error;
  }
}

/** i18n key for each error kind — messages live under "errors" in every locale file. */
export function errorMessageKey(error: AppError) {
  return `errors.${error.kind}` as const;
}

/** Transient failures worth an automatic retry. */
export function isRetryable(error: AppError): boolean {
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server';
}
