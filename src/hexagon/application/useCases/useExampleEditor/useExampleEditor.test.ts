import type { ExampleTechnical } from '@learncraft-spanish/shared';
import { useTableValidation as realUseTableValidation } from '@application/units/pasteTable/hooks/useTableValidation';
import { useEditTableState as realUseEditTableState } from '@application/units/pasteTable/useEditTableState';
import { useExampleEditor } from '@application/useCases/useExampleEditor/useExampleEditor';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockExampleTechnicalList } from '@testing/factories/exampleFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const recordedExampleIds: number[][] = [];

const {
  mock: examplesToEdit,
  override: overrideExamplesToEdit,
  reset: resetExamplesToEdit,
} = createOverrideableMock({
  examples: createMockExampleTechnicalList(3) as ExampleTechnical[] | undefined,
  isLoading: false,
  error: null as Error | null,
});

const {
  mock: exampleMutations,
  override: overrideExampleMutations,
  reset: resetExampleMutations,
} = createOverrideableMock({
  createExamples: async () => [],
  examplesCreating: false,
  examplesCreatingError: null as Error | null,
  updateExamples: async () => [],
  examplesUpdating: false,
  examplesUpdatingError: null as Error | null,
  deleteExamples: async () => 0,
  examplesDeleting: false,
  examplesDeletingError: null as Error | null,
});

const {
  mock: selectedContext,
  override: overrideSelectedContext,
  reset: resetSelectedContext,
} = createOverrideableMock({
  selectedExampleIds: [] as number[],
  updateSelectedExamples: (_exampleIds: number[]): void => undefined,
  addSelectedExample: (_exampleId: number): void => undefined,
  removeSelectedExample: (_exampleId: number): void => undefined,
  clearSelectedExamples: (): void => undefined,
});

const { mock: editTableApi, reset: resetEditTable } = createOverrideableMock({
  useEditTableState: (options: Parameters<typeof realUseEditTableState>[0]) =>
    realUseEditTableState(options),
});

const { mock: validationApi, reset: resetValidation } = createOverrideableMock({
  useTableValidation: (options: Parameters<typeof realUseTableValidation>[0]) =>
    realUseTableValidation(options),
});

vi.mock('@application/queries/ExampleQueries/useExamplesToEditQuery', () => ({
  useExamplesToEditQuery: (ids: number[]) => {
    recordedExampleIds.push(ids);
    return examplesToEdit;
  },
}));

vi.mock('@application/queries/ExampleQueries/useExampleMutations', () => ({
  useExampleMutations: () => exampleMutations,
}));

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: () => selectedContext,
}));

vi.mock('@application/units/pasteTable', async () => {
  const actual = (await vi.importActual(
    '@application/units/pasteTable',
  )) as Record<string, unknown>;
  return {
    ...actual,
    useEditTableState: (options: Parameters<typeof realUseEditTableState>[0]) =>
      editTableApi.useEditTableState(options),
  };
});

vi.mock('@application/units/pasteTable/hooks', async () => {
  const actual = (await vi.importActual(
    '@application/units/pasteTable/hooks',
  )) as Record<string, unknown>;
  return {
    ...actual,
    useTableValidation: (
      options: Parameters<typeof realUseTableValidation>[0],
    ) => validationApi.useTableValidation(options),
  };
});

describe('useExampleEditor', () => {
  beforeEach(() => {
    recordedExampleIds.length = 0;
    resetExamplesToEdit();
    resetExampleMutations();
    resetSelectedContext();
    resetEditTable();
    resetValidation();
    overrideExamplesToEdit({
      examples: createMockExampleTechnicalList(3),
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper to create examples with specific audio states
   */
  const createExamplesWithAudio = (
    configs: { hasAudio: boolean; id: number }[],
  ): ExampleTechnical[] => {
    return configs.map(
      ({ hasAudio, id }) =>
        createMockExampleTechnicalList(1, {
          id,
          spanish: `Spanish ${id}`,
          english: `English ${id}`,
          spanishAudio: hasAudio ? `https://example.com/ex${id}la.mp3` : '',
          englishAudio: hasAudio ? `https://example.com/ex${id}en.mp3` : '',
          spanglish: false,
          vocabularyComplete: true,
        })[0],
    );
  };

  describe('initialization', () => {
    it('should initialize with source examples', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      // Should have 3 rows (default mock returns 3)
      expect(result.current.tableProps.rows).toHaveLength(3);
    });

    it('should not have unsaved changes initially', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.tableProps.hasUnsavedChanges).toBe(false);
      expect(result.current.tableProps.isSaving).toBe(false);
      expect(result.current.saveError).toBeNull();
    });

    it('should expose table columns', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const columnIds = result.current.tableProps.columns.map(
        (c: { id: string }) => c.id,
      );
      expect(columnIds).toContain('id');
      expect(columnIds).toContain('spanish');
      expect(columnIds).toContain('english');
      expect(columnIds).toContain('hasAudio');
      expect(columnIds).toContain('vocabularyComplete');
    });
  });

  describe('audio URL to boolean mapping', () => {
    it('should map examples WITH audio to hasAudio=true', () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 1 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.tableProps.rows[0];
      expect(row.cells.hasAudio).toBe('true');
    });

    it('should map examples WITHOUT audio to hasAudio=false', () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: false, id: 1 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.tableProps.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should map examples with only spanishAudio to hasAudio=false', () => {
      overrideExamplesToEdit({
        examples: createMockExampleTechnicalList(1, {
          spanishAudio: 'https://example.com/audio.mp3',
          englishAudio: '',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.tableProps.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should map examples with only englishAudio to hasAudio=false', () => {
      overrideExamplesToEdit({
        examples: createMockExampleTechnicalList(1, {
          spanishAudio: '',
          englishAudio: 'https://example.com/audio.mp3',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.tableProps.rows[0];
      expect(row.cells.hasAudio).toBe('false');
    });

    it('should correctly map mixed audio states', () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([
          { hasAudio: true, id: 1 },
          { hasAudio: false, id: 2 },
          { hasAudio: true, id: 3 },
        ]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rows = result.current.tableProps.rows;
      expect(rows[0].cells.hasAudio).toBe('true');
      expect(rows[1].cells.hasAudio).toBe('false');
      expect(rows[2].cells.hasAudio).toBe('true');
    });
  });

  describe('field mapping', () => {
    it('should map all ExampleTechnical fields correctly', () => {
      overrideExamplesToEdit({
        examples: createMockExampleTechnicalList(1, {
          id: 42,
          spanish: 'Hola mundo',
          english: 'Hello world',
          spanglish: false,
          vocabularyComplete: false,
          spanishAudio: 'https://example.com/ex42la.mp3',
          englishAudio: 'https://example.com/ex42en.mp3',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const row = result.current.tableProps.rows[0];

      expect(row.cells.id).toBe('42');
      expect(row.cells.spanish).toBe('Hola mundo');
      expect(row.cells.english).toBe('Hello world');
      expect(row.cells.spanglish).toBe('false');
      expect(row.cells.vocabularyComplete).toBe('false');
      expect(row.cells.hasAudio).toBe('true');
    });
  });

  describe('dirty state tracking', () => {
    it('should mark row dirty when spanish text is modified', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'Nuevo texto');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });
    });

    it('should mark row dirty when english text is modified', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'english', 'New text');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });
    });

    it('should mark row dirty when hasAudio is toggled', async () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 1 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });
    });
  });

  describe('discardChanges', () => {
    it('should revert all changes to source data', async () => {
      overrideExamplesToEdit({
        examples: createMockExampleTechnicalList(1, { spanish: 'Original' }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      act(() => {
        result.current.tableProps.onDiscard?.();
      });

      expect(result.current.tableProps.rows[0].cells.spanish).toBe('Original');
      expect(result.current.tableProps.hasUnsavedChanges).toBe(false);
    });

    it('should revert multiple modified rows', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rows = result.current.tableProps.rows;
      const originalValues = rows.map((r) => r.cells.spanish);

      act(() => {
        rows.forEach((row, i) => {
          result.current.tableProps.onCellChange(
            row.id,
            'spanish',
            `Modified ${i}`,
          );
        });
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      act(() => {
        result.current.tableProps.onDiscard?.();
      });

      result.current.tableProps.rows.forEach((row, i) => {
        expect(row.cells.spanish).toBe(originalValues[i]);
      });
    });
  });

  describe('applyChanges', () => {
    it('should call updateExamples with mapped UpdateExampleCommand', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideExampleMutations({ updateExamples: updateExamplesSpy });
      overrideExamplesToEdit({
        examples: createMockExampleTechnicalList(1, {
          id: 123,
          spanish: 'Original',
        }),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });

      expect(updateExamplesSpy).toHaveBeenCalled();
      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
      expect(calledWith[0].exampleId).toBe(123);
      expect(calledWith[0].spanish).toBe('Modified');
    });

    it('should generate audio URLs when hasAudio is true', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideExampleMutations({ updateExamples: updateExamplesSpy });
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: false, id: 456 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'hasAudio', 'true');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith[0].spanishAudio).toContain('ex456la.mp3');
      expect(calledWith[0].englishAudio).toContain('ex456en.mp3');
    });

    it('should clear audio URLs when hasAudio is false', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideExampleMutations({ updateExamples: updateExamplesSpy });
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 789 }]),
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith[0].spanishAudio).toBe('');
      expect(calledWith[0].englishAudio).toBe('');
    });

    it('should only send dirty rows', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideExampleMutations({ updateExamples: updateExamplesSpy });

      // Use stable examples with fixed IDs
      const stableExamples = createMockExampleTechnicalList(3);
      stableExamples[0].id = 100;
      stableExamples[1].id = 101;
      stableExamples[2].id = 102;
      overrideExamplesToEdit({
        examples: stableExamples,
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const secondRowId = result.current.tableProps.rows[1].id;

      act(() => {
        result.current.tableProps.onCellChange(
          secondRowId,
          'spanish',
          'Modified',
        );
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });

      const calledWith = updateExamplesSpy.mock.calls[0][0];
      expect(calledWith).toHaveLength(1);
    });

    it('should set isSaving during save operation', async () => {
      let resolvePromise: () => void;
      const slowSave = new Promise<[]>((resolve) => {
        resolvePromise = () => resolve([]);
      });
      overrideExampleMutations({ updateExamples: () => slowSave });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      let applyPromise: Promise<void>;
      act(() => {
        applyPromise = result.current.tableProps.onSave!();
      });

      expect(result.current.tableProps.isSaving).toBe(true);

      await act(async () => {
        resolvePromise!();
        await applyPromise;
      });

      expect(result.current.tableProps.isSaving).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should set saveError on failed save', async () => {
      overrideExampleMutations({
        updateExamples: async () => {
          throw new Error('Network error');
        },
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      try {
        await act(async () => {
          await result.current.tableProps.onSave?.();
        });
      } catch {
        // Expected to throw
      }

      await act(async () => {});

      expect(result.current.saveError).toBeInstanceOf(Error);
      expect(result.current.saveError?.message).toBe('Network error');
      expect(result.current.tableProps.isSaving).toBe(false);
    });

    it('should clear saveError on next save attempt', async () => {
      let callCount = 0;
      overrideExampleMutations({
        updateExamples: async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('First error');
          }
          return [];
        },
      });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'Modified');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      try {
        await act(async () => {
          await result.current.tableProps.onSave?.();
        });
      } catch {
        // Expected to throw
      }

      await act(async () => {});

      expect(result.current.saveError).not.toBeNull();

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });

      expect(result.current.saveError).toBeNull();
    });
  });

  describe('validation', () => {
    it('should have valid state initially', () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.tableProps.isValid).toBe(true);
    });

    it('should detect invalid state when spanish is cleared', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', '');
      });

      await waitFor(() => {
        expect(result.current.tableProps.isValid).toBe(false);
      });
    });

    it('should detect invalid state when english is cleared', async () => {
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'english', '');
      });

      await waitFor(() => {
        expect(result.current.tableProps.isValid).toBe(false);
      });
    });

    it('should reflect validation errors in validationState when validation fails', async () => {
      const updateExamplesSpy = vi.fn().mockResolvedValue([]);
      overrideExampleMutations({ updateExamples: updateExamplesSpy });

      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', '');
      });

      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      expect(result.current.tableProps.isValid).toBe(false);
      expect(result.current.tableProps.validationErrors[rowId]).toBeDefined();
      expect(
        result.current.tableProps.validationErrors[rowId].spanish,
      ).toBeDefined();

      await expect(
        act(async () => {
          await result.current.tableProps.onSave?.();
        }),
      ).rejects.toThrow('validation failed');
      expect(updateExamplesSpy).not.toHaveBeenCalled();
      expect(result.current.tableProps.isSaving).toBe(false);
    });
  });

  describe('audio cells', () => {
    const audioBase =
      'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples';

    it('derives playback urls from hasAudio and recomputes them when the cell changes', async () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 42 }]),
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const row = result.current.tableProps.rows[0];

      expect(row.cells.spanishAudio).toBe(`${audioBase}/ex42la.mp3`);
      expect(row.cells.englishAudio).toBe(`${audioBase}/ex42en.mp3`);
      expect(row.cells.spanglish).toBe('false');

      act(() => {
        result.current.tableProps.onCellChange(row.id, 'hasAudio', 'false');
      });

      await waitFor(() => {
        expect(result.current.tableProps.rows[0].cells.spanishAudio).toBe('');
        expect(result.current.tableProps.rows[0].cells.englishAudio).toBe('');
      });

      act(() => {
        result.current.tableProps.onCellChange(row.id, 'hasAudio', 'TRUE');
      });

      await waitFor(() => {
        expect(result.current.tableProps.rows[0].cells.hasAudio).toBe('TRUE');
        expect(result.current.tableProps.rows[0].cells.spanishAudio).toBe('');
      });
    });

    it('blocks save when audio fails to load for a row that has audio', async () => {
      const updateExamples = vi.fn(async () => []);
      overrideExampleMutations({ updateExamples });
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 5 }]),
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.audioErrorHandlers.onAudioError(rowId, 'spanishAudio');
        result.current.audioErrorHandlers.onAudioError(rowId, 'englishAudio');
      });

      await waitFor(() => {
        expect(result.current.tableProps.isValid).toBe(false);
      });
      expect(
        result.current.tableProps.validationErrors[rowId].spanishAudio,
      ).toBe('Audio failed to load');
      expect(
        result.current.tableProps.validationErrors[rowId].englishAudio,
      ).toBe('Audio failed to load');

      await expect(
        act(async () => {
          await result.current.tableProps.onSave?.();
        }),
      ).rejects.toThrow('validation failed');
      expect(updateExamples).not.toHaveBeenCalled();
    });

    it('clears one audio error and then the other', async () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 5 }]),
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.audioErrorHandlers.onAudioError(rowId, 'spanishAudio');
        result.current.audioErrorHandlers.onAudioError(rowId, 'englishAudio');
      });
      await waitFor(() => {
        expect(result.current.tableProps.isValid).toBe(false);
      });

      act(() => {
        result.current.audioErrorHandlers.onAudioSuccess(rowId, 'spanishAudio');
      });
      await waitFor(() => {
        expect(
          result.current.tableProps.validationErrors[rowId].spanishAudio,
        ).toBeUndefined();
      });
      expect(
        result.current.tableProps.validationErrors[rowId].englishAudio,
      ).toBe('Audio failed to load');
      expect(result.current.tableProps.isValid).toBe(false);

      act(() => {
        result.current.audioErrorHandlers.onAudioSuccess(rowId, 'englishAudio');
      });
      await waitFor(() => {
        expect(
          result.current.tableProps.validationErrors[rowId],
        ).toBeUndefined();
      });
      expect(result.current.tableProps.isValid).toBe(true);
    });

    it('ignores an audio error until the row actually has audio', async () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: false, id: 5 }]),
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.audioErrorHandlers.onAudioError(rowId, 'spanishAudio');
      });

      expect(result.current.tableProps.isValid).toBe(true);
      expect(
        result.current.tableProps.validationErrors[rowId]?.spanishAudio,
      ).toBeUndefined();

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'hasAudio', 'True');
      });

      await waitFor(() => {
        expect(
          result.current.tableProps.validationErrors[rowId].spanishAudio,
        ).toBe('Audio failed to load');
      });
      expect(result.current.tableProps.rows[0].cells.englishAudio).toBe('');
    });

    it('keeps field validation when an audio error is added', async () => {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: true, id: 5 }]),
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = result.current.tableProps.rows[0].id;

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'english', '');
        result.current.audioErrorHandlers.onAudioError(rowId, 'englishAudio');
      });

      await waitFor(() => {
        expect(result.current.tableProps.validationErrors[rowId].english).toBe(
          'Required',
        );
      });
      expect(
        result.current.tableProps.validationErrors[rowId].englishAudio,
      ).toBe('Audio failed to load');
    });
  });

  describe('spanish text and edit commands', () => {
    it('marks spanglish when the spanish cell contains an asterisk', async () => {
      overrideExamplesToEdit({
        examples: createMockExampleTechnicalList(1, {
          id: 3,
          spanish: 'sin asterisco',
          english: 'no asterisk',
        }),
        isLoading: false,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = result.current.tableProps.rows[0].id;
      expect(result.current.tableProps.rows[0].cells.spanglish).toBe('false');

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'a*b');
      });

      await waitFor(() => {
        expect(result.current.tableProps.rows[0].cells.spanglish).toBe('true');
        expect(result.current.tableProps.rows[0].cells.spanish).toBe('a*b');
      });

      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', '');
      });
      await waitFor(() => {
        expect(result.current.tableProps.rows[0].cells.spanglish).toBe('false');
        expect(result.current.tableProps.isValid).toBe(false);
      });
    });

    it('sends the edited spanish text with regenerated audio and vocabulary', async () => {
      const updateExamples = vi.fn(async () => []);
      overrideExampleMutations({ updateExamples });
      const [example] = createMockExampleTechnicalList(1, {
        id: 15,
        spanish: 'original',
        english: 'original english',
        vocabularyComplete: false,
        spanishAudio: 'https://custom.example/keep.mp3',
        englishAudio: 'https://custom.example/keep-en.mp3',
      });
      overrideExamplesToEdit({
        examples: [example],
        isLoading: false,
        error: null,
      });
      overrideSelectedContext({ selectedExampleIds: [15, 16] });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      expect(recordedExampleIds.at(-1)).toEqual([15, 16]);
      expect(result.current.tableProps.columns).toEqual([
        { id: 'id', type: 'read-only', editable: false },
        { id: 'spanish', type: 'textarea', required: true },
        { id: 'english', type: 'textarea', required: true },
        { id: 'hasAudio', type: 'boolean' },
        { id: 'spanishAudio', type: 'text', editable: false, derived: true },
        { id: 'englishAudio', type: 'text', editable: false, derived: true },
        {
          id: 'relatedVocabulary',
          type: 'custom',
          editable: false,
          derived: true,
        },
        { id: 'vocabularyComplete', type: 'boolean' },
      ]);
      expect(
        JSON.parse(result.current.tableProps.rows[0].cells.relatedVocabulary),
      ).toEqual(example.vocabulary.map((item) => item.id));

      const rowId = result.current.tableProps.rows[0].id;
      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'cambiado');
      });
      await waitFor(() => {
        expect(result.current.tableProps.rows[0].cells.spanish).toBe(
          'cambiado',
        );
      });
      act(() => {
        result.current.tableProps.onCellChange(rowId, 'english', 'changed');
      });
      await waitFor(() => {
        expect(result.current.tableProps.rows[0].cells.english).toBe('changed');
      });

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });

      expect(updateExamples).toHaveBeenCalledWith([
        {
          exampleId: 15,
          spanish: 'cambiado',
          english: 'changed',
          spanishAudio:
            'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples/ex15la.mp3',
          englishAudio:
            'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples/ex15en.mp3',
          relatedVocabulary: example.vocabulary.map((item) => item.id),
          vocabularyComplete: false,
        },
      ]);
    });

    it('turns a non-Error save failure into an Error and clears it on the next attempt', async () => {
      let attempts = 0;
      overrideExampleMutations({
        updateExamples: async () => {
          attempts += 1;
          if (attempts === 1) {
            const failure: unknown = 'disk full';
            throw failure;
          }
          return [];
        },
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = result.current.tableProps.rows[0].id;
      act(() => {
        result.current.tableProps.onCellChange(rowId, 'spanish', 'cambiado');
      });
      await waitFor(() => {
        expect(result.current.tableProps.hasUnsavedChanges).toBe(true);
      });

      try {
        await act(async () => {
          await result.current.tableProps.onSave?.();
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('disk full');
      }
      await act(async () => {});
      expect(result.current.saveError?.message).toBe('disk full');
      expect(result.current.tableProps.isSaving).toBe(false);

      await act(async () => {
        await result.current.tableProps.onSave?.();
      });
      expect(result.current.saveError).toBeNull();
    });

    it('passes the loading flag and an empty row list when there is nothing to edit', () => {
      overrideExamplesToEdit({
        examples: undefined,
        isLoading: true,
        error: null,
      });
      const { result } = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.tableProps.isLoading).toBe(true);
      expect(result.current.tableProps.rows).toEqual([]);
    });
  });

  describe('related vocabulary cells', () => {
    async function editVocabulary(value: string) {
      overrideExamplesToEdit({
        examples: createExamplesWithAudio([{ hasAudio: false, id: 9 }]),
        isLoading: false,
        error: null,
      });
      const view = renderHook(() => useExampleEditor(), {
        wrapper: MockAllProviders,
      });
      const rowId = view.result.current.tableProps.rows[0].id;
      act(() => {
        view.result.current.tableProps.onCellChange(
          rowId,
          'relatedVocabulary',
          value,
        );
      });
      await waitFor(() => {
        expect(
          view.result.current.tableProps.rows[0].cells.relatedVocabulary,
        ).toBe(value);
      });
      return { view, rowId };
    }

    it('accepts a JSON array of numbers', async () => {
      const { view, rowId } = await editVocabulary('[1, 2]');
      expect(view.result.current.tableProps.isValid).toBe(true);
      expect(
        view.result.current.tableProps.validationErrors[rowId],
      ).toBeUndefined();
    });

    it('rejects a value that is not an array', async () => {
      const { view, rowId } = await editVocabulary('{"id":1}');
      expect(view.result.current.tableProps.isValid).toBe(false);
      expect(
        view.result.current.tableProps.validationErrors[rowId]
          .relatedVocabulary,
      ).toBe('Related vocabulary must be an array');
    });

    it('rejects vocabulary ids that are not numbers', async () => {
      const { view, rowId } = await editVocabulary('[1, "x"]');
      expect(
        view.result.current.tableProps.validationErrors[rowId]
          .relatedVocabulary,
      ).toBe('All vocabulary IDs must be valid numbers');
    });

    it('rejects invalid JSON', async () => {
      const { view, rowId } = await editVocabulary('not-json');
      expect(
        view.result.current.tableProps.validationErrors[rowId]
          .relatedVocabulary,
      ).toBe('Invalid format: must be a valid array');
    });

    it('treats a blank vocabulary cell as having no custom vocabulary error', async () => {
      const { view, rowId } = await editVocabulary('   ');
      expect(
        view.result.current.tableProps.validationErrors[rowId]
          ?.relatedVocabulary,
      ).not.toBe('Invalid format: must be a valid array');
      expect(
        view.result.current.tableProps.validationErrors[rowId]
          ?.relatedVocabulary,
      ).not.toBe('Related vocabulary must be an array');
      expect(
        view.result.current.tableProps.validationErrors[rowId]
          ?.relatedVocabulary,
      ).not.toBe('All vocabulary IDs must be valid numbers');
    });
  });
});
