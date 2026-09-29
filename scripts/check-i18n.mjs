#!/usr/bin/env node
// Compares every locale's message keys against the default locale. Exit 1 on any difference.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/shared/i18n/messages';
const BASE_LOCALE = 'es';

/** Flattens {"profile":{"title":"…"}} into ["profile.title"]. */
function keys(value, prefix = '') {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

const load = (locale) =>
  new Set(keys(JSON.parse(readFileSync(join(DIR, `${locale}.json`), 'utf8'))));
const reference = load(BASE_LOCALE);
let failed = false;

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const locale = file.replace(/\.json$/, '');
  if (locale === BASE_LOCALE) continue;
  const current = load(locale);
  const missing = [...reference].filter((k) => !current.has(k));
  const extra = [...current].filter((k) => !reference.has(k));
  if (missing.length || extra.length) {
    failed = true;
    for (const k of missing) console.error(`${locale}: missing "${k}"`);
    for (const k of extra) console.error(`${locale}: not in ${BASE_LOCALE} "${k}"`);
  }
}

if (failed) process.exit(1);
console.log(`i18n: every locale matches ${BASE_LOCALE}`);
