import type { VocabularyPort } from '@application/ports/vocabularyPort';
import { useVocabularyAdapter } from '@application/adapters/vocabularyAdapter';
import { useAllVocabulary } from '@application/queries/useAllVocabulary';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockVocabularyList } from '@testing/factories/vocabularyFactories';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import {
  resetTestQueryClient,
  testQueryClient,
} from '@testing/utils/testQueryClient';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/vocabularyAdapter', () => ({
  useVocabularyAdapter: vi.fn(),
}));

const mockGetVocabulary = vi.fn<VocabularyPort['getVocabulary']>();

function renderUseAllVocabulary() {
  return renderHook(() => useAllVocabulary(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useAllVocabulary', () => {
  beforeEach(() => {
    resetTestQueryClient();
    mockGetVocabulary.mockReset();
    vi.mocked(useVocabularyAdapter).mockReturnValue({
      getVocabulary: mockGetVocabulary,
      getVocabularyBySubcategory: vi.fn(),
      getVocabularyById: vi.fn(),
      getVocabularyCount: vi.fn(),
      getVocabularyCountBySubcategory: vi.fn(),
      createVocabulary: vi.fn(),
      deleteVocabulary: vi.fn(),
      getRelatedRecords: vi.fn(),
    });
  });

  it('returns the catalog once the query resolves', async () => {
    const vocabulary = createMockVocabularyList();
    mockGetVocabulary.mockResolvedValue(vocabulary);

    const { result } = renderUseAllVocabulary();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vocabulary).toEqual(vocabulary);
    expect(result.current.error).toBeNull();
  });

  it('returns an empty catalog when the endpoint has no records', async () => {
    mockGetVocabulary.mockResolvedValue([]);

    const { result } = renderUseAllVocabulary();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vocabulary).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a failed catalog fetch as an Error and an empty list', async () => {
    mockGetVocabulary.mockRejectedValue(new Error('catalog down'));

    const { result } = renderUseAllVocabulary();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.vocabulary).toEqual([]);
    expect(result.current.error).toEqual(new Error('catalog down'));
  });

  it('shares the vocabulary query key with the admin vocabulary unit', async () => {
    mockGetVocabulary.mockResolvedValue([]);

    const { result } = renderUseAllVocabulary();

    await waitFor(() => expect(result.current.loading).toBe(false));
    const keys = testQueryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual(['vocabulary']);
  });
});
