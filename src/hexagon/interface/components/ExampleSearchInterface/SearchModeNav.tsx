// import type { ReactNode } from 'react';
import '@interface/components/ExampleManager/ExampleManagerSubNav.scss';
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
  { mode: 'ids', label: 'Search by IDs' },
  { mode: 'text', label: 'Search by Text' },
  { mode: 'recentlyEdited', label: 'Recently Edited Examples' },
  { mode: 'filter', label: 'Filter Panel' },
  { mode: 'quiz', label: 'Search by Quiz' },
];

export function SearchModeNav({
  activeMode,
  onModeChange,
}: {
  activeMode: ExampleSearchMode;
  onModeChange: (mode: ExampleSearchMode) => void;
}) {
  return (
    <div className="ExampleManagerSubNav">
      {NAV_OPTIONS.map((option) => (
        <label
          key={option.mode}
          className={`ExampleManagerSubNavOption ${activeMode === option.mode ? 'selected' : ''}`}
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
