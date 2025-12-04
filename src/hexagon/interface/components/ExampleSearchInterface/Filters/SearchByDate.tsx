export type DateMode = 'created' | 'modified';

export interface SearchByDateProps {
  fromDate: string;
  toDate: string;
  mode: DateMode;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onModeChange: (mode: DateMode) => void;
}

export function SearchByDate({
  fromDate,
  toDate,
  mode,
  onFromDateChange,
  onToDateChange,
  onModeChange,
}: SearchByDateProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <input
            type="radio"
            name="dateSearchMode"
            value="modified"
            checked={mode === 'modified'}
            onChange={() => onModeChange('modified')}
          />
          <span>Recently Modified</span>
        </label>
        <label
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <input
            type="radio"
            name="dateSearchMode"
            value="created"
            checked={mode === 'created'}
            onChange={() => onModeChange('created')}
          />
          <span>Recently Created</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <div>From</div>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => onFromDateChange(event.target.value)}
            style={{ padding: '0.5rem' }}
          />
        </div>
        <div>
          <div>To</div>
          <input
            type="date"
            value={toDate}
            onChange={(event) => onToDateChange(event.target.value)}
            style={{ padding: '0.5rem' }}
          />
        </div>
      </div>
    </div>
  );
}
