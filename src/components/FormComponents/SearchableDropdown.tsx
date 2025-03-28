import { useMemo, useState } from 'react';
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
  const [showOptions, setShowOptions] = useState(false);
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
  };

  return (
    <div className="searchable-dropdown">
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
            onFocus={() => setShowOptions(true)}
            onBlur={() =>
              setTimeout(() => {
                setShowOptions(false);
              }, 200)
            }
          />
          {showOptions && (
            <div className="options">
              {filteredOptions.map((option) => (
                <div
                  className="option"
                  key={option.value}
                  onClick={() => onChange(option.value)}
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
