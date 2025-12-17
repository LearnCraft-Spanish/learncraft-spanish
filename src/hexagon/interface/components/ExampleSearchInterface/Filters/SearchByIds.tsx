export interface SearchByIdsProps {
  input: string;
  onInputChange: (value: string) => void;
}

export function SearchByIds({ input, onInputChange }: SearchByIdsProps) {
  const parsedIds = input
    .split(',')
    .map((val) => Number(val.trim()))
    .filter((val) => val > 0 && !Number.isNaN(val));

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="e.g. 10, 23, 42"
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem' }}
      />

      <div style={{ marginBottom: '0.75rem' }}>
        <small>Parsed IDs: {parsedIds.join(', ') || 'None'}</small>
      </div>
    </div>
  );
}
