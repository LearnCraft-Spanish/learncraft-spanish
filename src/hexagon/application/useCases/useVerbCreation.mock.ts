import type {
  UseVerbCreationResult,
  VerbData,
} from '@application/useCases/types';
import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { vi } from 'vitest';

// Create default mock data
export const defaultResult: UseVerbCreationResult = {
  verbSubcategories: createMockSubcategoryList(3).filter(
    (s) => s.partOfSpeech === PartOfSpeech.Verb,
  ),
  loadingSubcategories: false,
  selectedSubcategoryId: '1',
  setSelectedSubcategoryId: vi.fn<(id: string) => void>(),
  creating: false,
  creationError: null,
  createVerb: vi
    .fn<(verbData: VerbData) => Promise<boolean>>()
    .mockResolvedValue(true),
};

// Create the mock with its implementation defined here
export const mockUseVerbCreation = vi
  .fn<() => UseVerbCreationResult>()
  .mockReturnValue(defaultResult);

// Helper to override mock values for specific tests
export const overrideMockUseVerbCreation = (
  config: Partial<UseVerbCreationResult> = {},
) => {
  const result = { ...defaultResult, ...config };
  mockUseVerbCreation.mockReturnValue(result);
  return result;
};

// Export default for global mocking
export default mockUseVerbCreation;
