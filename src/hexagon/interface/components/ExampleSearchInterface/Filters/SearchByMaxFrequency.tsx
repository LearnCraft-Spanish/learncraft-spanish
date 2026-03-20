import { VocabularyCompleteFilter } from '@interface/components/ExampleSearchInterface/Filters/VocabularyCompleteFilter';
import { GenericDropdown } from '@interface/components/FormComponents';

export type SpanglishFilter = 'all' | 'only-spanglish' | 'no-spanglish';

export interface SearchByMaxFrequencyProps {
  highestFirst: boolean;
  onHighestFirstChange: (value: boolean) => void;
  spanglish: SpanglishFilter;
  onSpanglishChange: (value: SpanglishFilter) => void;
  vocabularyComplete: boolean | undefined;
  onVocabularyCompleteChange: (value: boolean | undefined) => void;
}

export function SearchByMaxFrequency({
  highestFirst,
  onHighestFirstChange,
  spanglish,
  onSpanglishChange,
  vocabularyComplete,
  onVocabularyCompleteChange,
}: SearchByMaxFrequencyProps) {
  return (
    <div className="searchByMaxFrequencyFilterWrapper">
      <GenericDropdown
        label="Max Frequency Order"
        selectedValue={highestFirst.toString()}
        onChange={(value) => onHighestFirstChange(value === 'true')}
        options={[
          { value: 'true', text: 'Highest to Lowest' },
          { value: 'false', text: 'Lowest to Highest' },
        ]}
        defaultOptionText="Select order"
        editMode
        required
      />

      <GenericDropdown
        label="Spanglish"
        selectedValue={spanglish}
        onChange={(value) => onSpanglishChange(value as SpanglishFilter)}
        options={[
          { value: 'all', text: 'All' },
          { value: 'only-spanglish', text: 'Only Spanglish' },
          { value: 'no-spanglish', text: 'No Spanglish' },
        ]}
        defaultOptionText="Select spanglish"
        editMode
        required
      />

      <VocabularyCompleteFilter
        value={vocabularyComplete}
        onChange={onVocabularyCompleteChange}
      />
    </div>
  );
}

