import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ItemsListPage, itemsListQuery } from '@/features/items';

export const Route = createFileRoute('/items/')({
  // Prefetch on navigation (and on hover, through defaultPreload: 'intent'). The swallowed rejection
  // keeps the loader from throwing, so a failed load reaches the view model and the Screen's error
  // state (with retry) — not the route's errorComponent. (Query 5.104 deprecates prefetchQuery for
  // query(options).catch(noop).)
  loader: ({ context }) => context.queryClient.query(itemsListQuery()).catch(noop),
  component: ItemsListPage,
});
