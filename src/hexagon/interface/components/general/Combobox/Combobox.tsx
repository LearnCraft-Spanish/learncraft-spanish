import type { ChangeEvent, FocusEvent, JSX, KeyboardEvent } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { useEffect, useRef, useState } from 'react';
import styles from './Combobox.module.scss';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  id: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  /** Shown while the field is empty, e.g. "Search lessons". */
  placeholder?: string;
  /** Copy for a filter with no hits. The typed text is appended in quotes. */
  emptyLabel?: string;
  /** Marks a required scope control with the action border. */
  emphasis?: boolean;
  invalid?: boolean;
  /** Id of the hint or error that describes this control. */
  describedBy?: string;
  disabled?: boolean;
}

const WORD_BREAK = /[^\p{L}\p{N}]+/u;

/**
 * Case-insensitive substring filter. Options whose label contains the query
 * as a whole word sort first, so typing "12" lists Lesson 12 ahead of
 * Lesson 112 and Lesson 120 instead of burying it.
 */
export function filterComboboxOptions(
  options: ComboboxOption[],
  query: string,
): ComboboxOption[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return options;
  }

  const wordHits: ComboboxOption[] = [];
  const partialHits: ComboboxOption[] = [];
  for (const option of options) {
    const label = option.label.toLowerCase();
    if (label.split(WORD_BREAK).includes(needle)) {
      wordHits.push(option);
    } else if (label.includes(needle) || option.value === needle) {
      partialHits.push(option);
    }
  }
  return [...wordHits, ...partialHits];
}

/**
 * A `Select` the learner can type into. At rest it reads like the native
 * dropdown; on focus the current label is selected so the first keystroke
 * starts a filter. Enter picks the highlighted row, Escape or leaving the
 * field drops the typed text and shows the chosen label again.
 */
export function Combobox({
  id,
  value,
  options,
  onChange,
  placeholder,
  emptyLabel = 'No matches',
  emphasis = false,
  invalid = false,
  describedBy,
  disabled = false,
}: ComboboxProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectOnMouseUp = useRef(false);

  const [open, setOpen] = useState(false);
  /** `null` while showing the chosen label; a string once the learner types. */
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const listId = `${id}-listbox`;
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? '';
  const visible =
    query === null ? options : filterComboboxOptions(options, query);
  const activeOption = open ? visible[activeIndex] : undefined;

  function optionId(option: ComboboxOption): string {
    return `${id}-option-${option.value}`;
  }

  function openList(): void {
    if (options.length === 0) {
      return;
    }
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setOpen(true);
  }

  function closeList(): void {
    setOpen(false);
    setQuery(null);
  }

  function commit(option: ComboboxOption): void {
    onChange(option.value);
    closeList();
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>): void {
    selectOnMouseUp.current = true;
    event.target.select();
    openList();
  }

  /* A mouse click would collapse the selection made on focus; keep it once. */
  function handleMouseUp(): void {
    if (selectOnMouseUp.current) {
      selectOnMouseUp.current = false;
      inputRef.current?.select();
    }
  }

  function handleClick(): void {
    if (!open) {
      openList();
    }
  }

  function handleBlur(): void {
    selectOnMouseUp.current = false;
    closeList();
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
    setActiveIndex(0);
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          openList();
        } else if (visible.length > 0) {
          setActiveIndex(Math.min(activeIndex + 1, visible.length - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex(Math.max(activeIndex - 1, 0));
        }
        break;
      case 'Enter':
        if (open) {
          event.preventDefault();
          if (activeOption !== undefined) {
            commit(activeOption);
          }
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          closeList();
        }
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    const active = listRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    // jsdom has no scrollIntoView; the optional call keeps tests honest.
    active?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex]);

  const inputClassName = [
    styles.input,
    emphasis ? styles.emphasis : undefined,
    invalid ? styles.invalid : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const chevronClassName = open
    ? `${styles.chevron} ${styles.chevronOpen}`
    : styles.chevron;

  return (
    <div className={styles.root}>
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        className={inputClassName}
        value={query ?? selectedLabel}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeOption !== undefined ? optionId(activeOption) : undefined
        }
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onFocus={handleFocus}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onBlur={handleBlur}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />
      <span className={chevronClassName}>
        <Icon name="chevronDown" size="md" tone="muted" />
      </span>
      {open && (
        <div
          className={styles.panel}
          // Keep focus in the field so a click on a row is not a blur first.
          onMouseDown={(event) => event.preventDefault()}
        >
          {visible.length === 0 ? (
            <div className={styles.empty}>
              {`${emptyLabel} “${query ?? ''}”`}
            </div>
          ) : (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              className={styles.list}
            >
              {visible.map((option, index) => {
                const isActive = index === activeIndex;
                const isSelected = option.value === value;
                const optionClassName = [
                  styles.option,
                  isActive ? styles.optionActive : undefined,
                  isSelected ? styles.optionSelected : undefined,
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  // Pointer handling lives on the row; the input owns focus
                  // and the keyboard (aria-activedescendant pattern).
                  <li
                    key={option.value}
                    id={optionId(option)}
                    role="option"
                    aria-selected={isSelected}
                    data-active={isActive || undefined}
                    className={optionClassName}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(option)}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                    {isSelected && (
                      <Icon name="check" size="sm" tone="action" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
