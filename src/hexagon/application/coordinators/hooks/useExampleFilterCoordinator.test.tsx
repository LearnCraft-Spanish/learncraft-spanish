import type { UseSkillTagsReturnType } from '@application/queries/useSkillTags';
import type { SkillTag } from '@learncraft-spanish/shared';
import type { ReactNode } from 'react';
import { useExampleFilterCoordinator } from '@application/coordinators/hooks/useExampleFilterCoordinator';
import { ExampleFilterContextProvider } from '@application/coordinators/providers/ExampleFilterContextProvider';
import { SkillType } from '@learncraft-spanish/shared';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseSkillTags = vi.hoisted(() => vi.fn());

vi.mock('@application/queries/useSkillTags', () => ({
  useSkillTags: mockUseSkillTags,
}));

const tag = (vocabularyId: number): SkillTag => ({
  type: SkillType.Vocabulary,
  key: `Vocabulary-${vocabularyId}`,
  name: `word ${vocabularyId}`,
  descriptor: '',
  vocabularyId,
  subcategoryName: 'Nouns',
  frequency: null,
});

const catalog: SkillTag[] = [tag(1), tag(2), tag(3)];

const setSkillTags = (
  overrides: Partial<UseSkillTagsReturnType> = {},
): void => {
  mockUseSkillTags.mockReturnValue({
    skillTags: catalog,
    isLoading: false,
    error: null,
    ...overrides,
  });
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ExampleFilterContextProvider>{children}</ExampleFilterContextProvider>
);

const renderCoordinator = () =>
  renderHook(() => useExampleFilterCoordinator(), { wrapper });

const selectedKeys = (
  result: ReturnType<typeof renderCoordinator>['result'],
): string[] => result.current.selectedSkillTags.map((t) => t.key);

describe('useExampleFilterCoordinator', () => {
  beforeEach(() => {
    mockUseSkillTags.mockReset();
    setSkillTags();
  });

  describe('initial state', () => {
    it('starts with no filters applied', () => {
      const { result } = renderCoordinator();

      expect(result.current.filterStateWithoutLesson).toEqual({
        excludeSpanglish: false,
        audioOnly: false,
        skillTagKeys: [],
        includeUnpublished: false,
      });
      expect(result.current.selectedSkillTags).toEqual([]);
    });
  });

  describe('selected skill tags', () => {
    it('resolves the selected keys to tags from the skill tag catalog', () => {
      const { result } = renderCoordinator();

      act(() =>
        result.current.bulkUpdateSkillTagKeys(['Vocabulary-1', 'Vocabulary-3']),
      );

      expect(result.current.selectedSkillTags).toEqual([
        catalog[0],
        catalog[2],
      ]);
      expect(result.current.filterStateWithoutLesson.skillTagKeys).toEqual([
        'Vocabulary-1',
        'Vocabulary-3',
      ]);
    });

    it('has no selected tags while the catalog is loading', () => {
      setSkillTags({ isLoading: true });
      const { result } = renderCoordinator();

      act(() => result.current.bulkUpdateSkillTagKeys(['Vocabulary-1']));

      expect(result.current.selectedSkillTags).toEqual([]);
    });

    it('has no selected tags when the catalog failed to load', () => {
      setSkillTags({ skillTags: catalog, error: new Error('catalog failed') });
      const { result } = renderCoordinator();

      act(() => result.current.bulkUpdateSkillTagKeys(['Vocabulary-1']));

      expect(result.current.selectedSkillTags).toEqual([]);
    });

    it('has no selected tags when the catalog is unavailable', () => {
      setSkillTags({ skillTags: undefined });
      const { result } = renderCoordinator();

      act(() => result.current.bulkUpdateSkillTagKeys(['Vocabulary-1']));

      expect(result.current.selectedSkillTags).toEqual([]);
    });

    it('resolves the keys selected before loading finished once the catalog arrives', () => {
      setSkillTags({ skillTags: undefined, isLoading: true });
      const { result, rerender } = renderCoordinator();
      act(() => result.current.bulkUpdateSkillTagKeys(['Vocabulary-2']));

      setSkillTags();
      rerender();

      expect(selectedKeys(result)).toEqual(['Vocabulary-2']);
    });
  });

  describe('adding and removing skill tags', () => {
    it('adds a skill tag to the filters', () => {
      const { result } = renderCoordinator();

      act(() => result.current.addSkillTagToFilters('Vocabulary-1'));
      act(() => result.current.addSkillTagToFilters('Vocabulary-2'));

      expect(selectedKeys(result)).toEqual(['Vocabulary-1', 'Vocabulary-2']);
    });

    it('does not add a skill tag that is already selected', () => {
      const { result } = renderCoordinator();
      act(() => result.current.addSkillTagToFilters('Vocabulary-1'));

      act(() => result.current.addSkillTagToFilters('Vocabulary-1'));

      expect(selectedKeys(result)).toEqual(['Vocabulary-1']);
    });

    it('removes only the given skill tag from the filters', () => {
      const { result } = renderCoordinator();
      act(() =>
        result.current.bulkUpdateSkillTagKeys([
          'Vocabulary-1',
          'Vocabulary-2',
          'Vocabulary-3',
        ]),
      );

      act(() => result.current.removeSkillTagFromFilters('Vocabulary-2'));

      expect(selectedKeys(result)).toEqual(['Vocabulary-1', 'Vocabulary-3']);
    });

    it('leaves the selection alone when removing a tag that is not selected', () => {
      const { result } = renderCoordinator();
      act(() => result.current.bulkUpdateSkillTagKeys(['Vocabulary-1']));

      act(() => result.current.removeSkillTagFromFilters('Vocabulary-3'));

      expect(selectedKeys(result)).toEqual(['Vocabulary-1']);
    });

    it('replaces the whole selection when the tag keys are bulk updated', () => {
      const { result } = renderCoordinator();
      act(() => result.current.bulkUpdateSkillTagKeys(['Vocabulary-1']));

      act(() =>
        result.current.bulkUpdateSkillTagKeys(['Vocabulary-2', 'Vocabulary-3']),
      );

      expect(selectedKeys(result)).toEqual(['Vocabulary-2', 'Vocabulary-3']);
    });
  });

  describe('toggle filters', () => {
    it('updates excludeSpanglish without disturbing the other filters', () => {
      const { result } = renderCoordinator();
      act(() => result.current.updateAudioOnly(true));
      act(() => result.current.addSkillTagToFilters('Vocabulary-1'));

      act(() => result.current.updateExcludeSpanglish(true));

      expect(result.current.excludeSpanglish).toBe(true);
      expect(result.current.filterStateWithoutLesson).toEqual({
        excludeSpanglish: true,
        audioOnly: true,
        skillTagKeys: ['Vocabulary-1'],
        includeUnpublished: false,
      });
    });

    it('updates audioOnly without disturbing the other filters', () => {
      const { result } = renderCoordinator();
      act(() => result.current.updateExcludeSpanglish(true));
      act(() => result.current.addSkillTagToFilters('Vocabulary-1'));

      act(() => result.current.updateAudioOnly(true));

      expect(result.current.audioOnly).toBe(true);
      expect(result.current.filterStateWithoutLesson).toEqual({
        excludeSpanglish: true,
        audioOnly: true,
        skillTagKeys: ['Vocabulary-1'],
        includeUnpublished: false,
      });
    });

    it('updates includeUnpublished without disturbing the other filters', () => {
      const { result } = renderCoordinator();
      act(() => result.current.updateAudioOnly(true));
      act(() => result.current.addSkillTagToFilters('Vocabulary-1'));

      act(() => result.current.updateIncludeUnpublished(true));

      expect(result.current.includeUnpublished).toBe(true);
      expect(result.current.filterStateWithoutLesson).toEqual({
        excludeSpanglish: false,
        audioOnly: true,
        skillTagKeys: ['Vocabulary-1'],
        includeUnpublished: true,
      });
    });

    it('turns a filter back off', () => {
      const { result } = renderCoordinator();
      act(() => result.current.updateAudioOnly(true));

      act(() => result.current.updateAudioOnly(false));

      expect(result.current.audioOnly).toBe(false);
    });
  });

  describe('batch update', () => {
    it('replaces every filter at once', () => {
      const { result } = renderCoordinator();
      act(() => result.current.updateIncludeUnpublished(true));

      act(() =>
        result.current.batchUpdateFilterStateWithoutLesson({
          excludeSpanglish: true,
          audioOnly: true,
          skillTagKeys: ['Vocabulary-2'],
          includeUnpublished: false,
        }),
      );

      expect(result.current.excludeSpanglish).toBe(true);
      expect(result.current.audioOnly).toBe(true);
      expect(result.current.includeUnpublished).toBe(false);
      expect(selectedKeys(result)).toEqual(['Vocabulary-2']);
    });
  });

  describe('loading and error', () => {
    it('reports the skill tag catalog as loading', () => {
      setSkillTags({ skillTags: undefined, isLoading: true });

      const { result } = renderCoordinator();

      expect(result.current.isLoading).toBe(true);
    });

    it('is not loading once the catalog has loaded', () => {
      const { result } = renderCoordinator();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('surfaces a skill tag catalog failure', () => {
      const error = new Error('catalog failed');
      setSkillTags({ skillTags: undefined, error });

      const { result } = renderCoordinator();

      expect(result.current.error).toBe(error);
    });
  });
});
