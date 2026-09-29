import { RuleTester } from 'eslint';
import { afterAll, describe, it } from 'vitest';
import { noLiteralJsxText } from './rules/no-literal-jsx-text.js';
import { queryKeysFromFactory } from './rules/query-keys-from-factory.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

tester.run('no-literal-jsx-text', noLiteralJsxText, {
  valid: [
    'const a = <h1>{t("profile.title")}</h1>;',
    'const a = <span>·</span>;',
    'const a = <span>{count} / 42</span>;',
    'const a = <img alt={t("profile.avatar")} />;',
    'const a = <div className="flex gap-2" data-testid="row" />;',
  ],
  invalid: [
    { code: 'const a = <h1>Profile</h1>;', errors: [{ messageId: 'literal' }] },
    { code: 'const a = <button aria-label="Close" />;', errors: [{ messageId: 'literal' }] },
    { code: 'const a = <input placeholder={`Search`} />;', errors: [{ messageId: 'literal' }] },
    { code: 'const a = <p>Guardar cambios</p>;', errors: [{ messageId: 'literal' }] },
  ],
});

tester.run('query-keys-from-factory', queryKeysFromFactory, {
  valid: [
    'useQuery({ queryKey: profileKeys.detail(id), queryFn })',
    'const profileKeys = { all: ["profile"], detail: (id) => [...profileKeys.all, id] };',
  ],
  invalid: [
    { code: 'useQuery({ queryKey: ["profile", id], queryFn })', errors: [{ messageId: 'inline' }] },
    {
      code: 'queryClient.invalidateQueries({ queryKey: ["profile"] })',
      errors: [{ messageId: 'inline' }],
    },
  ],
});
