import { noLiteralJsxText } from './rules/no-literal-jsx-text.js';
import { queryKeysFromFactory } from './rules/query-keys-from-factory.js';

/** Project rules for Seed Test Static. Each rule documents the invariant it protects. */
// Named, not `export default {…}`: eslint-config-next warns on anonymous default exports.
const plugin = {
  meta: { name: 'eslint-plugin-seedteststatic' },
  rules: {
    'no-literal-jsx-text': noLiteralJsxText,
    'query-keys-from-factory': queryKeysFromFactory,
  },
};

export default plugin;
