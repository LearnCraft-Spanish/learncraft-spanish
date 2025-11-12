/**
 * Hexagonal Architecture Testing
 *
 * Central exports for testing utilities and helpers.
 * Import from this file to get access to all testing tools.
 */

export * from '@testing/factories/courseFactory';
// Re-export factories
export * from '@testing/factories/subcategoryFactories';
export * from '@testing/factories/vocabularyFactories';

export * from '@testing/providers/createQueryClientWrapper';
// Re-export providers
export * from '@testing/providers/TestQueryClientProvider';

// Re-export utilities
export * from '@testing/utils/setMockResult';
export * from '@testing/utils/testQueryClient';
export * from '@testing/utils/typedMock';
