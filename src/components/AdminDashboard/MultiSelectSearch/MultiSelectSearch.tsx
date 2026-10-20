import type { FocusEvent, JSX, KeyboardEvent } from 'react';
import { filterComboboxOptions } from '@interface/components/general/Combobox/Combobox';
import { useDismissable } from '@interface/components/general/Popover/useDismissable';
import { TextInput } from '@interface/components/general/TextInput/TextInput';
import { useCallback, useState } from 'react';
import styles from './MultiSelectSearch.module.scss';

export interface MultiSelectSearchOption {
  value: string;
  label: string;
}

interface MultiSelectSearchProps {
  id: string;
  options: MultiSelectSearchOption[];
  selected: readonly string[];
  onChange: (selected: readonly string[]) => void;
  /** Accessible name for the list of matches, e.g. "Membership types". */
  listLabel: string;
  placeholder?: string;
  /** Id of the hint or error that describes this input. */
  describedBy?: string;
}

/**
 * A search field that adds options to a selection. Chosen options drop out of
 * the list; show them with `SelectedOptionChips` wherever they belong on the
 * page. The list stays open after a pick so several can be added in a row.
 */
export function MultiSelectSearch({
  id,
  options,
  selected,
  onChange,
  listLabel,
  placeholder,
  describedBy,
}: MultiSelectSearchProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const { containerRef } = useDismissable(open, close);

  const unselected = options.filter(
    (option) => !selected.includes(option.value),
  );
  const matches = filterComboboxOptions(unselected, query);
  const active = Math.min(activeIndex, matches.length - 1);
  const trimmedQuery = query.trim();

  function choose(option: MultiSelectSearchOption): void {
    onChange([...selected, option.value]);
    setQuery('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setActiveIndex(Math.min(active + 1, matches.length - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(Math.max(active - 1, 0));
        break;
      case 'Enter':
        if (open && active >= 0) {
          event.preventDefault();
          choose(matches[active]);
        }
        break;
      default:
        break;
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>): void {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      close();
    }
  }

  return (
    // Keys bubble up from the input; the input keeps focus throughout.
    <div
      ref={containerRef}
      className={styles.root}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <TextInput
        id={id}
        value={query}
        onChange={(value) => {
          setQuery(value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        leadingIcon="search"
        onClear={() => setQuery('')}
        clearLabel="Clear search"
        describedBy={describedBy}
      />
      {open && (
        // Keep focus in the field so a click on a row is not a blur first.
        <div
          className={styles.panel}
          onMouseDown={(event) => event.preventDefault()}
        >
          {matches.length === 0 ? (
            <p className={styles.empty}>
              {trimmedQuery.length > 0
                ? `No matches “${trimmedQuery}”`
                : 'Everything is already selected'}
            </p>
          ) : (
            <ul role="listbox" aria-label={listLabel} className={styles.list}>
              {matches.map((option, index) => (
                // Pointer handling lives on the row; the input owns the keyboard.
                <li
                  key={option.value}
                  role="option"
                  aria-selected={index === active}
                  className={
                    index === active
                      ? `${styles.option} ${styles.optionActive}`
                      : styles.option
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
