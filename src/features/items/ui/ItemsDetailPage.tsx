import { getRouteApi } from '@tanstack/react-router';
import { ItemsDetailScreen } from './ItemsDetailScreen';
import { useItemsDetail } from './useItemsDetail';

const route = getRouteApi('/items/$id');

export function ItemsDetailPage() {
  const { id } = route.useParams();
  const { state, onRetry } = useItemsDetail(id);
  return <ItemsDetailScreen state={state} onRetry={onRetry} />;
}
