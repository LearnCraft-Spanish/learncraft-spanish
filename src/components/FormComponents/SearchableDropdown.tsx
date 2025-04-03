import type { KeyboardEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import x from 'src/assets/icons/x_dark.svg';
import './SearchableDropdown.css';

export default function SearchableDropdown({
  onChange,
  options,
  value,
  valueText,
}: {
  value: string;
  valueText: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  const [searchString, setSearchString] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const optionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const filteredOptions = useMemo(() => {
    if (searchString === '') {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchString.toLowerCase()),
    );
  }, [options, searchString]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1 >= filteredOptions.length ? 0 : prev + 1;
          optionsRef.current[next]?.focus();
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1;
          optionsRef.current[next]?.focus();
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(filteredOptions[focusedIndex].value);
          setSearchString('');
        }
        break;
    }
  };

  return (
    <div className="searchable-dropdown" onKeyDown={handleKeyDown}>
      {value !== '0' && value !== '' ? (
        <div className="displayContent">
          <p className="content">{valueText}</p>
          <button
            onClick={() => onChange('')}
            className="clearButton"
            type="button"
          >
            <img src={x} alt="x" />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            id="searchableDropdown"
            className="content"
            value={searchString}
            onChange={handleSearch}
          />
          {searchString.length > 0 && filteredOptions.length > 0 && (
            <div className="options" role="listbox" tabIndex={-1}>
              {filteredOptions.map((option, index) => (
                <div
                  className={`option ${focusedIndex === index ? 'focused' : ''}`}
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setSearchString('');
                  }}
                  ref={(el) => {
                    optionsRef.current[index] = el;
                  }}
                  role="option"
                  tabIndex={0}
                  aria-selected={focusedIndex === index}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
