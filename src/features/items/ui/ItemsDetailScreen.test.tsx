import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/shared/i18n/messages/es.json';
import { renderWithProviders } from '@/test/render';
import { ItemsDetailScreen } from './ItemsDetailScreen';

const item = { id: 'a', title: 'First', updatedAt: new Date('2026-09-01T12:00:00Z') };

describe('ItemsDetailScreen', () => {
  it('shows the title and the formatted update date', async () => {
    renderWithProviders(
      <ItemsDetailScreen state={{ status: 'content', data: item }} onRetry={vi.fn()} />,
    );

    expect(await screen.findByRole('heading', { level: 1, name: 'First' })).toBeInTheDocument();
    const date = new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(item.updatedAt);
    expect(screen.getByText((text) => text.includes(date))).toBeInTheDocument();
  });

  it('shows the not-found message without a retry button', async () => {
    renderWithProviders(
      <ItemsDetailScreen
        state={{ status: 'error', error: { kind: 'notFound' } }}
        onRetry={vi.fn()}
      />,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.items.notFound);
    expect(screen.queryByRole('button', { name: messages.common.retry })).not.toBeInTheDocument();
  });

  it('offers a retry for other errors', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <ItemsDetailScreen
        state={{ status: 'error', error: { kind: 'server', status: 500 } }}
        onRetry={onRetry}
      />,
    );

    await user.click(await screen.findByRole('button', { name: messages.common.retry }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows a loading status and a back link to the list', async () => {
    renderWithProviders(<ItemsDetailScreen state={{ status: 'loading' }} onRetry={vi.fn()} />);

    expect(
      await screen.findByRole('status', { name: messages.common.loading }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: messages.common.back })).toHaveAttribute(
      'href',
      '/items',
    );
  });

  it('treats an empty state as not found', async () => {
    renderWithProviders(<ItemsDetailScreen state={{ status: 'empty' }} onRetry={vi.fn()} />);
    expect(await screen.findByText(messages.items.notFound)).toBeInTheDocument();
  });
});
