import { vi } from 'vitest';
import { createTypedMock } from '../utils/typedMock';

// Define a test rule to check for untyped vi.fn() calls
const noUntypedMocks = {
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
              // Suggest replacing vi.fn() with createTypedMock<T>()
              return fixer.replaceText(node, 'createTypedMock<unknown>()');
            },
          });
        },
    };
  },
};

// Test with sample code
describe('no-untyped-mocks rule', () => {
  // Sample piece of code with untyped mocks
  const untypedCode = `
    import { vi } from 'vitest';
    
    // This is an untyped mock
    const untypedMock = vi.fn();
    
    // This is a typed mock (should not trigger)
    const typedViFnMock = vi.fn<() => string>();
    
    // This is already correct (should not trigger)
    const correctMock = createTypedMock<() => string>();
  `;

  it('should detect untyped mocks', () => {
    // Mock ESLint context for testing
    const context = {
      report: vi.fn(),
    };

    // Setup our rule with the mocked context
    const rule = noUntypedMocks.create(context);

    // Manually simulate ESLint detecting an untyped vi.fn() call
    const untypedNode = {
      type: 'CallExpression',
      callee: {
        object: { name: 'vi' },
        property: { name: 'fn' },
      },
      // No type parameters provided
      typeParameters: undefined,
    };

    // Call the rule handler
    rule['CallExpression[callee.object.name="vi"][callee.property.name="fn"]'](
      untypedNode,
    );

    // Verify the rule reports the issue
    expect(context.report).toHaveBeenCalledWith(
      expect.objectContaining({
        node: untypedNode,
        messageId: 'untypedMock',
      }),
    );
  });

  it('should not report typed vi.fn() calls', () => {
    // Mock ESLint context for testing
    const context = {
      report: vi.fn(),
    };

    // Setup our rule with the mocked context
    const rule = noUntypedMocks.create(context);

    // Simulate a node with type parameters
    const typedNode = {
      type: 'CallExpression',
      callee: {
        object: { name: 'vi' },
        property: { name: 'fn' },
      },
      // Has type parameters
      typeParameters: {
        params: [{ type: 'TSTypeReference', typeName: { name: 'string' } }],
      },
    };

    // Call the rule handler
    rule['CallExpression[callee.object.name="vi"][callee.property.name="fn"]'](
      typedNode,
    );

    // Verify no issue was reported
    expect(context.report).not.toHaveBeenCalled();
  });
});
