import type { QueryClient } from '@tanstack/react-query';
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  type ErrorComponentProps,
} from '@tanstack/react-router';
import { lazy, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { reportError } from '@/shared/lib/observability/report-error';
import { Button } from '@/shared/ui/button';

// Devtools only in development — lazy-imported so they never reach the production bundle.
const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [{ TanStackRouterDevtools }, { ReactQueryDevtools }] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ]);
      return {
        default: () => (
          <>
            <TanStackRouterDevtools />
            <ReactQueryDevtools />
          </>
        ),
      };
    })
  : () => null;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootError,
});

function RootLayout() {
  const { t } = useTranslation();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">
        {t('app.skipToContent')}
      </a>
      <header className="border-b p-4">
        <nav className="flex gap-4">
          <Link to="/">{t('app.nav.home')}</Link>
          <Link to="/items">{t('app.nav.items')}</Link>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <Suspense>
        <Devtools />
      </Suspense>
    </>
  );
}

function NotFound() {
  const { t } = useTranslation();
  return <p className="p-4">{t('app.notFound')}</p>;
}

function RootError({ error }: ErrorComponentProps) {
  const { t } = useTranslation();
  useEffect(() => {
    reportError(error);
  }, [error]);
  return (
    <div role="alert" className="space-y-3 p-4">
      <p>{t('app.error.title')}</p>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('app.error.reload')}
      </Button>
    </div>
  );
}
