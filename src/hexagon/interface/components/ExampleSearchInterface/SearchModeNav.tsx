// import type { ReactNode } from 'react';
import '@interface/components/ExampleSearchInterface/SearchModeNav.scss';
export type ExampleSearchMode =
  | 'filter'
  | 'quiz'
  | 'text'
  | 'ids'
  | 'recentlyEdited';

interface NavOption {
  mode: ExampleSearchMode;
  label: string;
  // description?: ReactNode;
}

const NAV_OPTIONS: NavOption[] = [
  { mode: 'filter', label: 'Filter Panel' },
  { mode: 'quiz', label: 'Search by Quiz' },
  { mode: 'text', label: 'Search by Text' },
  { mode: 'ids', label: 'Search by IDs' },
  { mode: 'recentlyEdited', label: 'Recently Edited Examples' },
];

export function SearchModeNav({
  activeMode,
  onModeChange,
}: {
  activeMode: ExampleSearchMode;
  onModeChange: (mode: ExampleSearchMode) => void;
}) {
  return (
    <div className="searchModeNav">
      {NAV_OPTIONS.map((option) => (
        <label
          key={option.mode}
          className={`searchModeNavOption ${activeMode === option.mode ? 'selected' : ''}`}
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
