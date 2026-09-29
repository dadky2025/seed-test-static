// e2e/mock-api.ts — serves every feature's api/<feature>.fixtures.json for E2E and local development.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { join } from 'node:path';

const PORT = 4010;
const FEATURES = 'src/features';

interface Fixture {
  id: string;
}

// feature name -> its fixtures, discovered by file name so a new feature needs no edit here.
const fixtures = new Map<string, Fixture[]>();
for (const feature of readdirSync(FEATURES)) {
  const file = join(FEATURES, feature, 'api', `${feature}.fixtures.json`);
  if (existsSync(file)) fixtures.set(feature, JSON.parse(readFileSync(file, 'utf8')) as Fixture[]);
}

function send(res: ServerResponse, status: number, body?: unknown) {
  // Every response, errors and preflights included: the app on :3000 calls this origin cross-origin.
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
  });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

const NOT_FOUND = { message: 'not found' };

/** GET /health · /<feature>/items · /<feature>/items/<id> → [status, body]. */
function route(method: string | undefined, pathname: string): [number, unknown?] {
  if (method === 'OPTIONS') return [204];
  const [feature, resource, id, ...rest] = pathname.split('/').filter(Boolean);
  if (feature === 'health' && !resource) return [200, { status: 'ok' }];
  const items = feature ? fixtures.get(feature) : undefined;
  if (!items || resource !== 'items' || rest.length > 0) return [404, NOT_FOUND];
  if (!id) return [200, items];
  const item = items.find((candidate) => candidate.id === id);
  return item ? [200, item] : [404, NOT_FOUND];
}

createServer((req, res) => {
  const [status, body] = route(req.method, new URL(req.url ?? '/', 'http://localhost').pathname);
  send(res, status, body);
}).listen(PORT, () => {
  console.warn(`mock API on http://localhost:${PORT}`);
});
