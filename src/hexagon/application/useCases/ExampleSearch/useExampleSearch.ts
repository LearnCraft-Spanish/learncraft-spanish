import type { SearchByIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByIds';
import type { SearchByQuizProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByQuiz';
import type { SearchByTextProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByText';
import type { LocalFilterPanelResultsProps } from '@interface/components/ExampleSearchInterface/Results/LocalFilterPanelResults';
import type { SearchByIdsResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByIdsResults';
import type { SearchByQuizResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import type { SearchByTextResultsProps } from '@interface/components/ExampleSearchInterface/Results/SearchByTextResults';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { useCoursesWithLessons } from '@application/queries/useCoursesWithLessons';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface SearchComponentProps {
  onFilterChange: () => void;
  searchByQuizProps: SearchByQuizProps;
  searchByTextProps: SearchByTextProps;
  searchByIdsProps: SearchByIdsProps;
  searchByRecentlyEditedProps: {
    vocabularyComplete: boolean | undefined;
    onVocabularyCompleteChange: (value: boolean | undefined) => void;
  };
}

export interface SearchResultProps {
  localFilterResultsProps: LocalFilterPanelResultsProps;
  quizResultsProps: SearchByQuizResultsProps;
  textResultsProps: SearchByTextResultsProps;
  idsResultsProps: SearchByIdsResultsProps;
  recentlyEditedResultsProps: { vocabularyComplete: boolean | undefined };
}

export function useExampleSearch() {
  // Mode state
  const [mode, setMode] = useState<ExampleSearchMode>('ids');
  const [searchIsTriggered, setSearchIsTriggered] = useState(false);
  const [nonValidSearchErrorMessage, setNonValidSearchErrorMessage] =
    useState('');

  // Text search state
  const [spanishInput, setSpanishInput] = useState('');
  const [englishInput, setEnglishInput] = useState('');

  // IDs search state
  const [idsInput, setIdsInput] = useState('');

  // Quiz search state
  const [courseCode, setCourseCode] = useState('');
  const [quizNumber, setQuizNumber] = useState<number | ''>('');

  // Shared vocabulary complete filter (for text, quiz, and recentlyEdited modes)
  const [vocabularyComplete, setVocabularyComplete] = useState<
    boolean | undefined
  >(undefined);

  // Combined filters for filter panel
  const filtersForUI = useCombinedFilters({
    onFilterChange: () => setSearchIsTriggered(false),
  });

  // Get course data for lesson calculations
  const { data: coursesWithLessons } = useCoursesWithLessons();

  // Extract values needed for useEffect to avoid dependency issues
  const courseId = filtersForUI.courseId;
  const updateToLessonNumber = filtersForUI.updateToLessonNumber;

  // Effect to set toLessonNumber to last lesson when course changes
  useEffect(() => {
    if (!courseId || !coursesWithLessons) return;

    const newCourse = coursesWithLessons.find((c) => c.id === courseId);
    if (!newCourse || !newCourse.lessons.length) return;

    const lastLesson =
      newCourse.lessons[newCourse.lessons.length - 1]?.lessonNumber ?? 0;
    if (lastLesson > 0) {
      updateToLessonNumber(lastLesson);
    }
  }, [courseId, coursesWithLessons, updateToLessonNumber]);

  const trimmedSpanishInput = spanishInput.trim();
  const trimmedEnglishInput = englishInput.trim();
  const trimmedIdsInput = idsInput.trim();
  const parsedIds = trimmedIdsInput
    .split(/[\t\n\r, ]/)
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
      if (
        trimmedSpanishInput.length === 0 &&
        trimmedEnglishInput.length === 0
      ) {
        setNonValidSearchErrorMessage(
          'ERROR: Please enter at least one charcter in either the Spanish or English field.',
        );
        return false;
      }
      return true;
    }
    if (mode === 'ids') {
      if (parsedIds.length === 0) {
        setNonValidSearchErrorMessage('ERROR: Please enter at least one ID.');
        return false;
      }
      return true;
    }
    if (mode === 'quiz') {
      if (
        courseCode.trim().length === 0 ||
        typeof quizNumber !== 'number' ||
        quizNumber <= 0
      ) {
        setNonValidSearchErrorMessage(
          'ERROR: Please select a course and quiz.',
        );
        return false;
      }
      return true;
    }
    if (mode === 'recentlyEdited') {
      return true;
    }
    if (mode === 'filter') {
      if (
        !filtersForUI.courseId ||
        filtersForUI.courseId <= 0 ||
        !filtersForUI.toLessonNumber ||
        filtersForUI.toLessonNumber <= 0
      ) {
        setNonValidSearchErrorMessage(
          'ERROR: Please select a course and To Lesson.',
        );
        return false;
      }

      return true;
    }
    return true;
  }, [
    mode,
    parsedIds.length,
    trimmedSpanishInput.length,
    trimmedEnglishInput.length,
    courseCode,
    quizNumber,
    filtersForUI.courseId,
    filtersForUI.toLessonNumber,
  ]);

  // Callback to reset search when filters change
  const handleFilterChange = useCallback(() => {
    setSearchIsTriggered(false);
  }, []);

  // Build props objects
  const searchComponentProps: SearchComponentProps = useMemo(
    () => ({
      onFilterChange: handleFilterChange,
      searchByQuizProps: {
        courseCode: courseCode ?? '',
        quizNumber: quizNumber ?? 0,
        onCourseCodeChange: withSearchReset(setCourseCode),
        onQuizNumberChange: withSearchReset(setQuizNumber),
        vocabularyComplete,
        onVocabularyCompleteChange: withSearchReset(setVocabularyComplete),
      },
      searchByTextProps: {
        spanishInput,
        englishInput,
        onSpanishInputChange: withSearchReset(setSpanishInput),
        onEnglishInputChange: withSearchReset(setEnglishInput),
        vocabularyComplete,
        onVocabularyCompleteChange: withSearchReset(setVocabularyComplete),
      },
      searchByIdsProps: {
        input: idsInput,
        onInputChange: withSearchReset(setIdsInput),
      },
      searchByRecentlyEditedProps: {
        vocabularyComplete,
        onVocabularyCompleteChange: withSearchReset(setVocabularyComplete),
      },
    }),
    [
      handleFilterChange,
      courseCode,
      quizNumber,
      spanishInput,
      englishInput,
      idsInput,
      vocabularyComplete,
      withSearchReset,
    ],
  );

  const searchResultProps: SearchResultProps = useMemo(
    () => ({
      localFilterResultsProps: {
        skillTags: filtersForUI.selectedSkillTags,
        excludeSpanglish: filtersForUI.excludeSpanglish,
        audioOnly: filtersForUI.audioOnly,
        lessonRanges: filtersForUI.filterState.lessonRanges,
      },
      quizResultsProps: {
        courseCode,
        quizNumber: typeof quizNumber === 'number' ? quizNumber : undefined,
        vocabularyComplete,
      },
      textResultsProps: {
        spanishString: spanishInput,
        englishString: englishInput,
        vocabularyComplete,
      },
      recentlyEditedResultsProps: {
        vocabularyComplete,
      },
      idsResultsProps: {
        ids: parsedIds,
      },
    }),
    [
      filtersForUI.selectedSkillTags,
      filtersForUI.excludeSpanglish,
      filtersForUI.audioOnly,
      filtersForUI.filterState.lessonRanges,
      courseCode,
      quizNumber,
      spanishInput,
      englishInput,
      parsedIds,
      vocabularyComplete,
    ],
  );

  const handleChangeMode = useCallback((newMode: ExampleSearchMode) => {
    setSearchIsTriggered(false);
    setVocabularyComplete(undefined);
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
    nonValidSearchErrorMessage,

    // Actions
    handleChangeMode,
    triggerSearch,

    // Props for components
    searchComponentProps,
    searchResultProps,
  };
}
