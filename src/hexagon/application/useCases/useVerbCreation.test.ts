// Import the mock implementations
import {
  mockUseSubcategories,
  resetMockUseSubcategories,
} from '@application/units/useSubcategories.mock';
import {
  mockUseVocabulary,
  overrideMockUseVocabulary,
  resetMockUseVocabulary,
} from '@application/units/useVocabulary.mock';
import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { renderHook } from '@testing-library/react';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';

import { afterEach, describe, expect, it, vi } from 'vitest';
import { useVerbCreation } from './useVerbCreation';

// Mock the hook modules
vi.mock('@application/units/useSubcategories', () => ({
  useSubcategories: () => mockUseSubcategories,
}));

vi.mock('@application/units/useVocabulary', () => ({
  useVocabulary: () => mockUseVocabulary,
}));

describe('useVerbCreation', () => {
  // Reset mocks after each test
  afterEach(() => {
    resetMockUseSubcategories();
    resetMockUseVocabulary();
  });

  afterAll(() => {
    vi.unmock('@application/units/useSubcategories');
    vi.unmock('@application/units/useVocabulary');
  });

  it('should filter for verb subcategories', () => {
    // Act
    const { result } = renderHook(() => useVerbCreation(), {
      wrapper: TestQueryClientProvider,
    });

    // Assert - initial state should already have subcategories available
    expect(result.current.verbSubcategories.length).toBeGreaterThan(0);
    expect(
      result.current.verbSubcategories.every(
        (s) =>
          s.partOfSpeech === PartOfSpeech.Verb ||
          s.name?.toLowerCase().includes('verb') ||
          s.name?.toLowerCase().includes('action'),
      ),
    ).toBe(true);
  });

  it('should handle verb creation', async () => {
    // Create a mock verb for the result
    const mockCreatedVerb = createMockVocabulary({ id: 1 });
    const mockVerbData = {
      infinitive: 'hablar',
      translation: 'to speak',
      subcategoryId: '1',
      isRegular: true,
    };

    // Override only the createVerb method
    overrideMockUseVocabulary({
      createVerb: vi.fn().mockResolvedValue(mockCreatedVerb),
      creating: false,
      creationError: null,
    });

    // Act
    const { result } = renderHook(() => useVerbCreation(), {
      wrapper: TestQueryClientProvider,
    });

    const success = await result.current.createVerb(mockVerbData);

    // Assert
    expect(success).toBe(true);
    expect(result.current.creationError).toBeNull();
    expect(mockUseVocabulary.createVerb).toHaveBeenCalledWith({
      infinitive: 'hablar',
      translation: 'to speak',
      isRegular: true,
      notes: undefined,
    });
  });

  it('should handle creation errors', async () => {
    // Setup the spy to capture the error state change
    const testError = new Error('Failed to create verb');
    const mockVerbData = {
      infinitive: 'hablar',
      translation: 'to speak',
      subcategoryId: '1',
      isRegular: true,
    };

    // Mock implementation that throws an error
    const createVerbMock = vi.fn().mockRejectedValue(testError);

    // Override the vocabulary mock for error handling
    overrideMockUseVocabulary({
      createVerb: createVerbMock,
      creating: false,
      // Set creationError to simulate the error being caught and set
      creationError: testError,
    });

    const { result } = renderHook(() => useVerbCreation(), {
      wrapper: TestQueryClientProvider,
    });

    // We need to trigger the error to be set in the hook's local state
    const success = await result.current.createVerb(mockVerbData);

    // Assert
    expect(success).toBe(false);
    // The error should come from the mock's creationError
    expect(result.current.creationError).toBe(testError);
    expect(result.current.creationError?.message).toBe('Failed to create verb');
  });

  it('should require subcategory selection', async () => {
    // Create custom mock implementation for createVerb that fails validation
    const createVerbMock = vi.fn().mockImplementation(() => {
      throw new Error('No subcategory selected');
    });

    // Setup our mocks to simulate the validation error
    overrideMockUseVocabulary({
      createVerb: createVerbMock,
      creationError: new Error('No subcategory selected'),
    });

    // Create verb data with empty subcategory ID
    const mockVerbData = {
      infinitive: 'hablar',
      translation: 'to speak',
      subcategoryId: '', // Empty subcategory
      isRegular: true,
    };

    // Act
    const { result } = renderHook(() => useVerbCreation(), {
      wrapper: TestQueryClientProvider,
    });

    // Call createVerb with empty subcategory - it should fail
    const success = await result.current.createVerb(mockVerbData);

    // Assert
    expect(success).toBe(false);
    // The error should be set on the result
    expect(result.current.creationError?.message).toBe(
      'No subcategory selected',
    );
  });
});
