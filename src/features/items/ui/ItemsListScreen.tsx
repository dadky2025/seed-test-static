import { useTranslation } from 'react-i18next';
import { errorMessageKey } from '@/shared/lib/errors';
import type { ScreenState } from '@/shared/lib/screen-state';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Item } from '../model/items';
import { ItemLink } from './ItemLink';

interface ItemsListScreenProps {
  state: ScreenState<Item[]>;
  onRetry: () => void;
}

export function ItemsListScreen({ state, onRetry }: ItemsListScreenProps) {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="items-title" className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 id="items-title" className="text-2xl font-semibold">
        {t('items.title')}
      </h1>

      {state.status === 'loading' && (
        <div role="status" aria-busy="true" aria-label={t('common.loading')} className="space-y-2">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="space-y-3">
          <p>{t(errorMessageKey(state.error))}</p>
          <Button onClick={onRetry}>{t('common.retry')}</Button>
        </div>
      )}

      {state.status === 'empty' && <p className="text-muted-foreground">{t('items.empty')}</p>}

      {state.status === 'content' && (
        <>
          <p className="text-sm text-muted-foreground">
            {t('items.count', { count: state.data.length })}
          </p>
          <ul className="divide-y divide-border rounded-md border">
            {state.data.map((item) => (
              <li key={item.id}>
                <ItemLink id={item.id} className="block p-3 hover:bg-muted focus-visible:outline-2">
                  {item.title}
                </ItemLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
