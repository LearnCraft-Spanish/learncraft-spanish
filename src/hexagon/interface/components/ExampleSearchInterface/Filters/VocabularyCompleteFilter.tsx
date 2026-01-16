import { GenericDropdown } from '@interface/components/FormComponents';
import './Filters.scss';
export interface VocabularyCompleteFilterProps {
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}

export function VocabularyCompleteFilter({
  value,
  onChange,
}: VocabularyCompleteFilterProps) {
  const handleChange = (input: string) => {
    const newValue =
      input === 'true' ? true : input === 'false' ? false : undefined;
    onChange(newValue);
  };

  const selectValue = value === undefined ? '' : String(value);

  return (
    <div className="vocabularyCompleteFilterWrapper">
      <GenericDropdown
        label="Vocabulary Complete"
        selectedValue={selectValue}
        onChange={handleChange}
        options={[
          { value: 'true', text: 'Complete' },
          { value: 'false', text: 'Incomplete' },
        ]}
        defaultOptionText="All (no filter)"
        editMode={true}
        required={false}
      />
      {/* <label
        htmlFor="vocabularyCompleteFilter"
        style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
      >
        Vocabulary Complete
      </label>
      <select
        id="vocabularyCompleteFilter"
        className="quizMenu"
        role="select"
        aria-label="Filter by Vocabulary Complete"
        value={selectValue}
        onChange={handleChange}
        style={{ padding: '0.5rem' }}
      >
        <option value="">All (no filter)</option>
        <option value="true">Complete</option>
        <option value="false">Incomplete</option>
      </select> */}
    </div>
  );
}
