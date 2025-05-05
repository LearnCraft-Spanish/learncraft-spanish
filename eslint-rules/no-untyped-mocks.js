import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  () =>
    'https://github.com/your-org/learncraft-spanish/blob/main/docs/rules/no-untyped-mocks.md',
);

/**
 * Rule to enforce using typed mocks in hexagonal architecture testing.
 * This ensures type safety and consistency in our test mocks.
 */
export default {
  rules: {
    'no-untyped-mocks': createRule({
      name: 'no-untyped-mocks',
      meta: {
        type: 'suggestion',
        docs: {
          description:
            'Enforce using typed mocks in hexagonal architecture testing',
        },
        fixable: null,
        schema: [], // no options
        messages: {
          untypedMock:
            'Untyped mock detected. Add an explicit type parameter to vi.fn<T>() for improved type safety, e.g., vi.fn<() => ReturnType>()',
        },
      },
      defaultOptions: [],

      create(context) {
        // Check if we're in a hexagonal architecture file
        const isHexagonalFile = (filename) => {
          return /\/hexagon\/[^\n\r/\u2028\u2029]*\/.*mock\.ts$/.test(filename);
        };

        return {
          // Look for vi.fn() calls without type parameters
          CallExpression(node) {
            const filename = context.getFilename();

            // Only apply in hexagonal architecture files
            if (!isHexagonalFile(filename)) {
              return;
            }

            const callee = node.callee;

            // Check if it's a vi.fn() call
            if (
              callee.type === 'MemberExpression' &&
              callee.object.type === 'Identifier' &&
              callee.object.name === 'vi' &&
              callee.property.type === 'Identifier' &&
              callee.property.name === 'fn'
            ) {
              // Check for typeArguments (the property shown in our AST debug)
              const hasTypeArguments = !!node.typeArguments;

              // Report only if no type arguments are provided
              if (!hasTypeArguments) {
                context.report({
                  node,
                  messageId: 'untypedMock',
                });
              }
            }
          },
        };
      },
    }),
  },
};
