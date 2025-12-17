import type { LocalFilterPanelProps } from '@interface/components/ExampleSearchInterface/Filters/LocalFilterPanel';
import type { SearchByIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import type { SearchByQuizProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import type { SearchByTextProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import type { LocalFilterPanelResultsProps } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import type { SearchByIdsResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByIdsResults';
import type { SearchByQuizResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import type { SearchByTextResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByTextResults';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { transformToLessonRanges } from '@domain/coursePrerequisites';
import { useCallback, useMemo, useState } from 'react';

export interface SearchComponentProps {
  localFilterProps: LocalFilterPanelProps;
  searchByQuizProps: SearchByQuizProps;
  searchByTextProps: SearchByTextProps;
  searchByIdsProps: SearchByIdsProps;
}

export interface SearchResultProps {
  localFilterResultsProps: LocalFilterPanelResultsProps;
  quizResultsProps: SearchByQuizResultsProps;
  textResultsProps: SearchByTextResultsProps;
  idsResultsProps: SearchByIdsResultsProps;
}

export function useExampleSearch() {
  // Mode state
  const [mode, setMode] = useState<ExampleSearchMode>('filter');
  const [searchIsTriggered, setSearchIsTriggered] = useState(false);

  // Text search state
  const [spanishInput, setSpanishInput] = useState('');
  const [englishInput, setEnglishInput] = useState('');

  // IDs search state
  const [idsInput, setIdsInput] = useState('');

  // Quiz search state
  const [courseCode, setCourseCode] = useState('');
  const [quizNumber, setQuizNumber] = useState<number | ''>('');

  // Filter panel state
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [fromLessonNumber, setFromLessonNumber] = useState<number>(0);
  const [toLessonNumber, setToLessonNumber] = useState<number>(0);

  // Combined filters for filter panel
  const filtersForUI = useCombinedFilters({});

  // Computed values
  const lessonRanges = useMemo(() => {
    return transformToLessonRanges({
      courseId: selectedCourseId ?? null,
      fromLessonNumber: fromLessonNumber ?? null,
      toLessonNumber: toLessonNumber ?? null,
    });
  }, [selectedCourseId, fromLessonNumber, toLessonNumber]);

  const trimmedSpanishInput = spanishInput.trim();
  const trimmedEnglishInput = englishInput.trim();
  const trimmedIdsInput = idsInput.trim();
  const parsedIds = trimmedIdsInput
    .split(',')
    .map((val) => Number(val.trim()))
    .filter((val) => val > 0 && !Number.isNaN(val));

  // Wrapper function to reset searchIsTriggered when any input changes
  const withSearchReset = useCallback(<T>(setter: (value: T) => void) => {
    return (value: T) => {
      setSearchIsTriggered(false);
      setter(value);
    };
  }, []);

  // Validation
  const isValidSearch = useMemo(() => {
    if (mode === 'text') {
      return trimmedSpanishInput.length > 0 || trimmedEnglishInput.length > 0;
    }
    if (mode === 'ids') {
      return parsedIds.length > 0;
    }
    if (mode === 'quiz') {
      return (
        courseCode.trim().length > 0 &&
        typeof quizNumber === 'number' &&
        quizNumber > 0
      );
    }
    if (mode === 'recentlyEdited') {
      return true;
    }
    if (mode === 'filter') {
      return selectedCourseId > 0;
    }
    return true;
  }, [
    mode,
    parsedIds.length,
    trimmedSpanishInput.length,
    trimmedEnglishInput.length,
    courseCode,
    quizNumber,
    selectedCourseId,
  ]);

  // Build props objects
  const searchComponentProps: SearchComponentProps = useMemo(
    () => ({
      localFilterProps: {
        excludeSpanglish: filtersForUI.excludeSpanglish,
        audioOnly: filtersForUI.audioOnly,
        onExcludeSpanglishChange: withSearchReset(
          filtersForUI.updateExcludeSpanglish,
        ),
        onAudioOnlyChange: withSearchReset(filtersForUI.updateAudioOnly),
        tagSearchTerm: filtersForUI.skillTagSearch.tagSearchTerm,
        tagSuggestions: filtersForUI.skillTagSearch.tagSuggestions,
        onTagSearchTermChange: (value) =>
          filtersForUI.skillTagSearch.updateTagSearchTerm(
            value
              ? ({ value } as unknown as EventTarget & HTMLInputElement)
              : undefined,
          ),
        onAddTag: withSearchReset(filtersForUI.addSkillTagToFilters),
        onRemoveTagFromSuggestions:
          filtersForUI.skillTagSearch.removeTagFromSuggestions,
        onAddTagBackToSuggestions:
          filtersForUI.skillTagSearch.addTagBackToSuggestions,
        selectedSkillTags: filtersForUI.selectedSkillTags,
        onRemoveSkillTag: withSearchReset(
          filtersForUI.removeSkillTagFromFilters,
        ),
        selectedCourseId,
        fromLessonNumber,
        toLessonNumber,
        onCourseChange: withSearchReset(setSelectedCourseId),
        onFromLessonChange: withSearchReset(setFromLessonNumber),
        onToLessonChange: withSearchReset(setToLessonNumber),
      },
      searchByQuizProps: {
        courseCode: courseCode ?? '',
        quizNumber: quizNumber ?? 0,
        onCourseCodeChange: withSearchReset(setCourseCode),
        onQuizNumberChange: withSearchReset(setQuizNumber),
      },
      searchByTextProps: {
        spanishInput,
        englishInput,
        onSpanishInputChange: withSearchReset(setSpanishInput),
        onEnglishInputChange: withSearchReset(setEnglishInput),
      },
      searchByIdsProps: {
        input: idsInput,
        onInputChange: withSearchReset(setIdsInput),
      },
    }),
    [
      filtersForUI,
      selectedCourseId,
      fromLessonNumber,
      toLessonNumber,
      courseCode,
      quizNumber,
      spanishInput,
      englishInput,
      idsInput,
      withSearchReset,
    ],
  );

  const searchResultProps: SearchResultProps = useMemo(
    () => ({
      localFilterResultsProps: {
        skillTags: filtersForUI.selectedSkillTags,
        excludeSpanglish: filtersForUI.excludeSpanglish,
        audioOnly: filtersForUI.audioOnly,
        lessonRanges,
      },
      quizResultsProps: {
        courseCode,
        quizNumber: typeof quizNumber === 'number' ? quizNumber : undefined,
      },
      textResultsProps: {
        spanishString: spanishInput,
        englishString: englishInput,
      },
      idsResultsProps: {
        ids: parsedIds,
      },
    }),
    [
      filtersForUI.selectedSkillTags,
      filtersForUI.excludeSpanglish,
      filtersForUI.audioOnly,
      lessonRanges,
      courseCode,
      quizNumber,
      spanishInput,
      englishInput,
      parsedIds,
    ],
  );

  const handleChangeMode = useCallback((newMode: ExampleSearchMode) => {
    setSearchIsTriggered(false);
    setMode(newMode);
  }, []);

  const triggerSearch = useCallback(() => {
    setSearchIsTriggered(true);
  }, []);

  return {
    // Current state
    mode,
    searchIsTriggered,
    isValidSearch,

    // Actions
    handleChangeMode,
    triggerSearch,

    // Props for components
    searchComponentProps,
    searchResultProps,
  };
}
