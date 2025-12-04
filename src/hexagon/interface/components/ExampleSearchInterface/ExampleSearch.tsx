import type { DateMode } from '@interface/components/ExampleSearchInterface/Filters/SearchByDate';
import type { SearchByTextsOrIdsProps } from '@interface/components/ExampleSearchInterface/Filters/SearchByTextsOrIds';
import type { ExampleSearchMode } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { useCombinedFilters } from '@application/units/Filtering/useCombinedFilters';
import { Filters } from '@interface/components/ExampleSearchInterface/Filters/Filters';
import { SearchModeNav } from '@interface/components/ExampleSearchInterface/SearchModeNav';
import { useMemo, useState } from 'react';

export default function ExampleSearch() {
  const [mode, setMode] = useState<ExampleSearchMode>('filter');
  const [textMode, setTextMode] =
    useState<SearchByTextsOrIdsProps['mode']>('spanish');
  const [textInput, setTextInput] = useState('');
  const filtersForUI = useCombinedFilters({});
  const [courseCode, setCourseCode] = useState('');
  const [quizNumber, setQuizNumber] = useState<number | ''>('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [dateMode, setDateMode] = useState<DateMode>('modified');

  const trimmedTextInput = textInput.trim();
  const parsedIds =
    textMode === 'ids'
      ? trimmedTextInput
          .split(',')
          .map((val) => Number(val.trim()))
          .filter((val) => !Number.isNaN(val))
      : [];

  const isValidSearch = useMemo(() => {
    if (mode === 'text') {
      if (textMode === 'ids') {
        return parsedIds.length > 0;
      }
      return trimmedTextInput.length > 0;
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
    textMode,
    parsedIds.length,
    trimmedTextInput.length,
    courseCode,
    quizNumber,
    fromDate,
    toDate,
  ]);

  return (
    <div>
      <h2>Example Search</h2>
      <SearchModeNav activeMode={mode} onModeChange={setMode} />

      <div style={{ marginTop: '1rem' }}>
        <Filters
          mode={mode}
          // LocalFilterPanel props
          localFilterProps={{
            excludeSpanglish: filtersForUI.excludeSpanglish,
            audioOnly: filtersForUI.audioOnly,
            onExcludeSpanglishChange: filtersForUI.updateExcludeSpanglish,
            onAudioOnlyChange: filtersForUI.updateAudioOnly,
            tagSearchTerm: filtersForUI.skillTagSearch.tagSearchTerm,
            tagSuggestions: filtersForUI.skillTagSearch.tagSuggestions,
            onTagSearchTermChange: (value) =>
              filtersForUI.skillTagSearch.updateTagSearchTerm(
                value
                  ? ({ value } as unknown as EventTarget & HTMLInputElement)
                  : undefined,
              ),
            onAddTag: filtersForUI.addSkillTagToFilters,
            onRemoveTagFromSuggestions:
              filtersForUI.skillTagSearch.removeTagFromSuggestions,
            onAddTagBackToSuggestions:
              filtersForUI.skillTagSearch.addTagBackToSuggestions,
            selectedSkillTags: filtersForUI.selectedSkillTags,
            onRemoveSkillTag: filtersForUI.removeSkillTagFromFilters,
          }}
          // SearchByDate props
          searchByDateProps={{
            fromDate: fromDate ?? '',
            toDate: toDate ?? '',
            mode: dateMode,
            onFromDateChange: setFromDate,
            onToDateChange: setToDate,
            onModeChange: setDateMode,
          }}
          // SearchByQuiz props
          searchByQuizProps={{
            courseCode: courseCode ?? '',
            quizNumber: quizNumber ?? 0,
            onCourseCodeChange: setCourseCode,
            onQuizNumberChange: setQuizNumber,
          }}
          // SearchByTextsOrIds props
          searchByTextsOrIdsProps={{
            mode: textMode,
            input: textInput,
            onModeChange: setTextMode,
            onInputChange: setTextInput,
          }}
        />

        {!isValidSearch && (
          <small>Fill required fields to see search results.</small>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        {isValidSearch && <p>Search results will go here</p>}
        {/* //   <Results
             mode={mode}
             localFilterResultsProps={{
               skillTags: filtersForUI.selectedSkillTags,
               excludeSpanglish: filtersForUI.excludeSpanglish,
               audioOnly: filtersForUI.audioOnly,
               lessonRanges: filtersForUI.filterState.lessonRanges,
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
             textsOrIdsResultsProps={{
               mode: textMode,
               array:
                 parsedIds.length > 0
                   ? parsedIds
                   : textInput.split(',').map((val) => val.trim()),
             }}
           />
         )}
           */}
      </div>
    </div>
  );
}
