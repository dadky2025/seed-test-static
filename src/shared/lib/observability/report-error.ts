/** The single place errors are sent (the console until a provider is added); call sites never import a vendor SDK. */
export function reportError(error: unknown, context?: Record<string, string>): void {
  console.error(error, context);
}
