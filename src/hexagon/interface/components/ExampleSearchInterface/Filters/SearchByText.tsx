import { VocabularyCompleteFilter } from '@interface/components/ExampleSearchInterface/Filters/VocabularyCompleteFilter';

export interface SearchByTextProps {
  spanishInput: string;
  englishInput: string;
  onSpanishInputChange: (value: string) => void;
  onEnglishInputChange: (value: string) => void;
  vocabularyComplete: boolean | undefined;
  onVocabularyCompleteChange: (value: boolean | undefined) => void;
}

export function SearchByText({
  spanishInput,
  englishInput,
  onSpanishInputChange,
  onEnglishInputChange,
  vocabularyComplete,
  onVocabularyCompleteChange,
}: SearchByTextProps) {
  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label
          htmlFor="spanishSearchInput"
          style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
        >
          Spanish Text
        </label>
        <input
          id="spanishSearchInput"
          type="text"
          value={spanishInput}
          onChange={(event) => onSpanishInputChange(event.target.value)}
          placeholder="Search Spanish text (comma-separated for multiple)"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <label
          htmlFor="englishSearchInput"
          style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
        >
          English Text
        </label>
        <input
          id="englishSearchInput"
          type="text"
          value={englishInput}
          onChange={(event) => onEnglishInputChange(event.target.value)}
          placeholder="Search English text (comma-separated for multiple)"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <VocabularyCompleteFilter
        value={vocabularyComplete}
        onChange={onVocabularyCompleteChange}
      />
    </div>
  );
}
