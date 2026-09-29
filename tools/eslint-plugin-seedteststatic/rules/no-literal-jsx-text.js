// Any letter in any script: "Guardar", "保存" and "Save" are all user-visible text; "·", "—", "42" are not.
const LETTER = /\p{L}/u;
// Attributes whose value is read by users or assistive technology.
const TEXT_ATTRIBUTES = new Set([
  'alt',
  'aria-label',
  'aria-description',
  'placeholder',
  'title',
  'label',
]);

function literalText(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0]?.value.cooked ?? null;
  return null;
}

/** @type {import('eslint').Rule.RuleModule} */
export const noLiteralJsxText = {
  meta: {
    type: 'problem',
    docs: {
      description: 'User-visible text comes from the i18n catalog, never from a JSX literal.',
    },
    schema: [],
    messages: { literal: 'User-visible text "{{text}}" must come from the i18n catalog (t(…)).' },
  },
  create(context) {
    const report = (node, text) =>
      context.report({ node, messageId: 'literal', data: { text: text.trim().slice(0, 40) } });

    return {
      JSXText(node) {
        if (LETTER.test(node.value)) report(node, node.value);
      },
      JSXAttribute(node) {
        if (node.name.type !== 'JSXIdentifier' || !TEXT_ATTRIBUTES.has(node.name.name)) return;
        const value =
          node.value?.type === 'JSXExpressionContainer' ? node.value.expression : node.value;
        const text = literalText(value);
        if (text !== null && LETTER.test(text)) report(node, text);
      },
    };
  },
};
