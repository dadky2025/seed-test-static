import { useTranslation } from 'react-i18next';
import { errorMessageKey } from '@/shared/lib/errors';
import type { ScreenState } from '@/shared/lib/screen-state';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Item } from '../model/items';
import { ItemsListLink } from './ItemLink';

interface ItemsDetailScreenProps {
  state: ScreenState<Item>;
  onRetry: () => void;
}

export function ItemsDetailScreen({ state, onRetry }: ItemsDetailScreenProps) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-2xl space-y-4 p-4">
      <ItemsListLink className="text-sm underline">{t('common.back')}</ItemsListLink>

      {state.status === 'loading' && (
        <div role="status" aria-busy="true" aria-label={t('common.loading')} className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      )}

      {state.status === 'error' &&
        (state.error.kind === 'notFound' ? (
          <p role="alert">{t('items.notFound')}</p>
        ) : (
          <div role="alert" className="space-y-3">
            <p>{t(errorMessageKey(state.error))}</p>
            <Button onClick={onRetry}>{t('common.retry')}</Button>
          </div>
        ))}

      {state.status === 'empty' && <p className="text-muted-foreground">{t('items.notFound')}</p>}

      {state.status === 'content' && (
        <>
          <h1 className="text-2xl font-semibold">{state.data.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t('items.updated', { date: state.data.updatedAt })}
          </p>
        </>
      )}
    </section>
  );
}
