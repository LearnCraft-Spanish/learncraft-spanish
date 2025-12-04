// import type { ReactNode } from 'react';

export type ExampleSearchMode = 'filter' | 'quiz' | 'text' | 'date';

interface NavOption {
  mode: ExampleSearchMode;
  label: string;
  // description?: ReactNode;
}

const NAV_OPTIONS: NavOption[] = [
  { mode: 'filter', label: 'Filter Panel' },
  { mode: 'quiz', label: 'Search by Quiz' },
  { mode: 'text', label: 'Search by Text / IDs' },
  { mode: 'date', label: 'Search by Date' },
];

export function SearchModeNav({
  activeMode,
  onModeChange,
}: {
  activeMode: ExampleSearchMode;
  onModeChange: (mode: ExampleSearchMode) => void;
}) {
  return (
    <div>
      {NAV_OPTIONS.map((option) => (
        <label
          key={option.mode}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginRight: '1rem',
            cursor: 'pointer',
          }}
        >
          <input
            type="radio"
            name="exampleSearchMode"
            value={option.mode}
            checked={activeMode === option.mode}
            onChange={() => onModeChange(option.mode)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
