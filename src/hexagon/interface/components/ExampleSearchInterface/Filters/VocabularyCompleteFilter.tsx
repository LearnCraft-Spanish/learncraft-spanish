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
        editMode
        required={false}
      />
    </div>
  );
}
