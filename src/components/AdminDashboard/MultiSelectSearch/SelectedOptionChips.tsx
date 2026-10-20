import type { JSX } from 'react';
import type { MultiSelectSearchOption } from './MultiSelectSearch';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Chip } from '@interface/components/general/Chip/Chip';
import styles from './MultiSelectSearch.module.scss';

interface SelectedOptionChipsProps {
  /** Names the group for screen readers, e.g. "Selected membership types". */
  label: string;
  options: MultiSelectSearchOption[];
  selected: readonly string[];
  onChange: (selected: readonly string[]) => void;
}

/** The selection from a `MultiSelectSearch`, as removable tag chips. */
export function SelectedOptionChips({
  label,
  options,
  selected,
  onChange,
}: SelectedOptionChipsProps): JSX.Element | null {
  if (selected.length === 0) {
    return null;
  }

  return (
    <div className={styles.chips} role="group" aria-label={label}>
      {selected.map((value) => (
        <Chip
          key={value}
          label={
            options.find((option) => option.value === value)?.label ?? value
          }
          tone="action"
          onRemove={() => onChange(selected.filter((item) => item !== value))}
        />
      ))}
      <Button variant="ghost" size="inline" muted onClick={() => onChange([])}>
        Clear all
      </Button>
    </div>
  );
}
