import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/shared/i18n/messages/es.json';
import { renderWithProviders } from '@/test/render';
import type { Item } from '../model/items';
import { ItemsListScreen } from './ItemsListScreen';

const items: Item[] = [
  { id: 'a', title: 'First', updatedAt: new Date('2026-09-01T00:00:00Z') },
  { id: 'b', title: 'Second', updatedAt: new Date('2026-08-01T00:00:00Z') },
];

describe('ItemsListScreen', () => {
  it('shows a busy status while loading', async () => {
    renderWithProviders(<ItemsListScreen state={{ status: 'loading' }} onRetry={vi.fn()} />);
    expect(await screen.findByRole('status', { name: messages.common.loading })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('shows the error message and a retry button that calls onRetry', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <ItemsListScreen state={{ status: 'error', error: { kind: 'network' } }} onRetry={onRetry} />,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.errors.network);
    await user.click(screen.getByRole('button', { name: messages.common.retry }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows the empty message', async () => {
    renderWithProviders(<ItemsListScreen state={{ status: 'empty' }} onRetry={vi.fn()} />);
    expect(await screen.findByText(messages.items.empty)).toBeInTheDocument();
  });

  it('renders each item as a link to its detail page', async () => {
    renderWithProviders(
      <ItemsListScreen state={{ status: 'content', data: items }} onRetry={vi.fn()} />,
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: messages.items.title }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(items.length);
    expect(screen.getByRole('link', { name: 'First' })).toHaveAttribute('href', '/items/a');
    expect(screen.getByRole('link', { name: 'Second' })).toHaveAttribute('href', '/items/b');
  });
});
