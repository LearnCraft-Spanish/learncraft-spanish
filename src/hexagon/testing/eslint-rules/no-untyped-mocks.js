/**
 * @fileoverview Rule to disallow untyped vi.fn() calls
 * @author LearnCraft-Spanish
 */

'use strict';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow untyped vi.fn() calls in favor of createTypedMock<T>()',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      untypedMock:
        'Use createTypedMock<T>() instead of vi.fn() for type safety',
    },
    fixable: 'code',
    schema: [], // no options
  },

  create(context) {
    return {
      // Detect calls to vi.fn()
      'CallExpression[callee.object.name="vi"][callee.property.name="fn"]':
        function (node) {
          // Check if there's a type parameter (indicating it's typed)
          if (node.typeParameters && node.typeParameters.params.length > 0) {
            return; // Already typed, no issue
          }

          // Report the issue
          context.report({
            node,
            messageId: 'untypedMock',
            fix: (fixer) => {
              // Suggest replacing vi.fn() with createTypedMock<unknown>()
              return fixer.replaceText(node, 'createTypedMock<unknown>()');
            },
          });
        },
    };
  },
};
