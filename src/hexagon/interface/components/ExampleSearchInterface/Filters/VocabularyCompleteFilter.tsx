export interface VocabularyCompleteFilterProps {
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}

export function VocabularyCompleteFilter({
  value,
  onChange,
}: VocabularyCompleteFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange(undefined);
    } else {
      onChange(selectedValue === 'true');
    }
  };

  const selectValue = value === undefined ? '' : String(value);

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label
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
      </select>
    </div>
  );
}
