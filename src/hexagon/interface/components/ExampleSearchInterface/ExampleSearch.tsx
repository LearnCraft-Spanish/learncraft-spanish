import type { DateMode } from '@interface/components/ExampleSearchInterface/Filters/SearchByDate';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { transformToLessonRanges } from '@domain/coursePrerequisites';
import { Filters } from '@interface/components/ExampleSearchInterface/Filters/Filters';
import { Results } from '@interface/components/ExampleSearchInterface/Results/Results';
import { SearchModeNav } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { SelectedExamples } from '@interface/components/ExampleSearchInterface/SelectedExamples';
import { useMemo, useState } from 'react';

export default function ExampleSearch() {
  const [mode, setMode] = useState<ExampleSearchMode>('filter');
  const [spanishInput, setSpanishInput] = useState('');
  const [englishInput, setEnglishInput] = useState('');
  const [idsInput, setIdsInput] = useState('');
  const filtersForUI = useCombinedFilters({});
  const [courseCode, setCourseCode] = useState('');
  const [quizNumber, setQuizNumber] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [dateMode, setDateMode] = useState<DateMode>('created');
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [fromLessonNumber, setFromLessonNumber] = useState<number>(0);
  const [toLessonNumber, setToLessonNumber] = useState<number>(0);

  const lessonRanges = useMemo(() => {
    return transformToLessonRanges({
      courseId: selectedCourseId ?? null,
      fromLessonNumber: fromLessonNumber ?? null,
      toLessonNumber: toLessonNumber ?? null,
    });
  }, [selectedCourseId, fromLessonNumber, toLessonNumber]);

  const [searchIsTriggered, setSearchIsTriggered] = useState(false);

  // Wrapper function to reset searchIsTriggered when any input changes
  const withSearchReset = <T,>(setter: (value: T) => void) => {
    return (value: T) => {
      setSearchIsTriggered(false);
      setter(value);
    };
  };

  const trimmedSpanishInput = spanishInput.trim();
  const trimmedEnglishInput = englishInput.trim();
  const trimmedIdsInput = idsInput.trim();
  const parsedIds = trimmedIdsInput
    .split(',')
    .map((val) => Number(val.trim()))
    .filter((val) => val > 0 && !Number.isNaN(val));

  const handleChangeMode = withSearchReset(setMode);

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
    if (mode === 'date') {
      return fromDate.length > 0 && toDate.length > 0;
    }
    return true; // filter mode: allow search, query will use current filters
  }, [
    mode,
    parsedIds.length,
    trimmedSpanishInput.length,
    trimmedEnglishInput.length,
    courseCode,
    quizNumber,
    fromDate,
    toDate,
  ]);

  return (
    <div>
      <h2>Example Search</h2>
      <SearchModeNav activeMode={mode} onModeChange={handleChangeMode} />

      <div style={{ marginTop: '1rem' }}>
        <Filters
          mode={mode}
          // LocalFilterPanel props
          localFilterProps={{
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
          }}
          // SearchByDate props
          searchByDateProps={{
            fromDate: fromDate ?? '',
            toDate: toDate ?? '',
            mode: dateMode,
            onFromDateChange: withSearchReset(setFromDate),
            onToDateChange: withSearchReset(setToDate),
            onModeChange: withSearchReset(setDateMode),
          }}
          // SearchByQuiz props
          searchByQuizProps={{
            courseCode: courseCode ?? '',
            quizNumber: quizNumber ?? 0,
            onCourseCodeChange: withSearchReset(setCourseCode),
            onQuizNumberChange: withSearchReset(setQuizNumber),
          }}
          // SearchByText props
          searchByTextProps={{
            spanishInput,
            englishInput,
            onSpanishInputChange: withSearchReset(setSpanishInput),
            onEnglishInputChange: withSearchReset(setEnglishInput),
          }}
          // SearchByIds props
          searchByIdsProps={{
            input: idsInput,
            onInputChange: withSearchReset(setIdsInput),
          }}
        />

        {!isValidSearch ? (
          <small>ERROR: Fill required fields to see search results.</small>
        ) : (
          <button type="button" onClick={() => setSearchIsTriggered(true)}>
            Search
          </button>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        {/* {isValidSearch && searchIsTriggered && (
          <p>Search results will go here</p>
        )} */}
        {isValidSearch && searchIsTriggered && (
          <Results
            mode={mode}
            localFilterResultsProps={{
              skillTags: filtersForUI.selectedSkillTags,
              excludeSpanglish: filtersForUI.excludeSpanglish,
              audioOnly: filtersForUI.audioOnly,
              lessonRanges,
            }}
            dateResultsProps={{
              _fromDate: fromDate,
              _toDate: toDate,
            }}
            quizResultsProps={{
              courseCode,
              quizNumber:
                typeof quizNumber === 'number' ? quizNumber : undefined,
            }}
            textResultsProps={{
              spanishString: spanishInput,
              englishString: englishInput,
            }}
            idsResultsProps={{
              ids: parsedIds,
            }}
          />
        )}
      </div>
      <SelectedExamples />
    </div>
  );
}
