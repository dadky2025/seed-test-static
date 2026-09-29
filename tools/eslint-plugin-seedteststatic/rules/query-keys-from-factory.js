/** @type {import('eslint').Rule.RuleModule} */
export const queryKeysFromFactory = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Query keys come from the feature key factory (<feature>/api/<feature>.keys.ts), so invalidation ' +
        'and reads can never disagree on a key.',
    },
    schema: [],
    messages: {
      inline:
        'Inline query key. Use the feature key factory, e.g. `queryKey: profileKeys.detail(id)`.',
    },
  },
  create(context) {
    return {
      Property(node) {
        const isQueryKey =
          (node.key.type === 'Identifier' && node.key.name === 'queryKey') ||
          (node.key.type === 'Literal' && node.key.value === 'queryKey');
        if (isQueryKey && node.value.type === 'ArrayExpression') {
          context.report({ node: node.value, messageId: 'inline' });
        }
      },
    };
  },
};
