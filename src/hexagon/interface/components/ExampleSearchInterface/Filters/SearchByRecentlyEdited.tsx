import { VocabularyCompleteFilter } from '@interface/components/ExampleSearchInterface/Filters/VocabularyCompleteFilter';

export interface SearchByRecentlyEditedProps {
  vocabularyComplete: boolean | undefined;
  onVocabularyCompleteChange: (value: boolean | undefined) => void;
}

export function SearchByRecentlyEdited({
  vocabularyComplete,
  onVocabularyCompleteChange,
}: SearchByRecentlyEditedProps) {
  return (
    <div>
      <VocabularyCompleteFilter
        value={vocabularyComplete}
        onChange={onVocabularyCompleteChange}
      />
    </div>
  );
}
