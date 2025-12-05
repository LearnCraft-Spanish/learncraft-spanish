type TextSearchMode = 'spanish' | 'english' | 'ids';

export interface SearchByTextsOrIdsProps {
  mode: TextSearchMode;
  input: string;
  onModeChange: (mode: TextSearchMode) => void;
  onInputChange: (value: string) => void;
}

export function SearchByTextsOrIds({
  mode,
  input,
  onModeChange,
  onInputChange,
}: SearchByTextsOrIdsProps) {
  // const parsedIds =
  //   mode === 'ids'
  //     ? input
  //         .split(',')
  //         .map((val) => Number(val.trim()))
  //         .filter((val) => !Number.isNaN(val))
  //     : [];

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          htmlFor="textSearchModeSpanish"
        >
          <input
            id="textSearchModeSpanish"
            type="radio"
            name="textSearchMode"
            value="spanish"
            checked={mode === 'spanish'}
            onChange={() => onModeChange('spanish')}
          />
          <span>Spanish</span>
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          htmlFor="textSearchModeEnglish"
        >
          <input
            id="textSearchModeEnglish"
            type="radio"
            name="textSearchMode"
            value="english"
            checked={mode === 'english'}
            onChange={() => onModeChange('english')}
          />
          <span>English</span>
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          htmlFor="textSearchModeIds"
        >
          <input
            id="textSearchModeIds"
            type="radio"
            name="textSearchMode"
            value="ids"
            checked={mode === 'ids'}
            onChange={() => onModeChange('ids')}
          />
          <span>ID</span>
        </label>
      </div>

      <input
        type="text"
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder={
          mode === 'ids'
            ? 'e.g. 10, 23, 42'
            : mode === 'spanish'
              ? 'Search Spanish text'
              : 'Search English text'
        }
        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem' }}
      />

      {/* {mode === 'ids' && (
        <div style={{ marginBottom: '0.75rem' }}>
          <small>Parsed IDs: {parsedIds.join(', ') || 'None'}</small>
        </div>
      )} */}
    </div>
  );
}
