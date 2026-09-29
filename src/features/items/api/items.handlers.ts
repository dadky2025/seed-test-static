import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import fixtures from './items.fixtures.json';

const url = (path: string) => new URL(path, env.apiBaseUrl).href;

export const itemsHandlers = [
  http.get(url('items/items'), () => HttpResponse.json(fixtures)),
  http.get(url('items/items/:id'), ({ params }) => {
    const item = fixtures.find((candidate) => candidate.id === params.id);
    return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 });
  }),
];
