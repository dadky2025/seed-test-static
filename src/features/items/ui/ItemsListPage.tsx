import { ItemsListScreen } from './ItemsListScreen';
import { useItemsList } from './useItemsList';

export function ItemsListPage() {
  const { state, onRetry } = useItemsList();
  return <ItemsListScreen state={state} onRetry={onRetry} />;
}
