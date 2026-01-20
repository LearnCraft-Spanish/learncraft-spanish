import { camelize } from '@interface/functions';

export interface GenericDropdownOption {
  value: string;
  text: string;
}

export default function GenericDropdown({
  label,
  selectedValue,
  onChange,
  options,
  editMode = true,
  defaultOptionText = 'Select',
  required = false,
}: {
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
  options: GenericDropdownOption[];
  editMode?: boolean;
  defaultOptionText?: string;
  required?: boolean;
}) {
  const camelLabel = camelize(label);

  return (
    <div className="lineWrapper">
      <label
        className={`label ${required && editMode ? 'required' : ''}`}
        htmlFor={`dropdown-${camelLabel}`}
      >
        {`${label}:`}
      </label>
      {editMode ? (
        <select
          id={`dropdown-${camelLabel}`}
          className="content"
          value={selectedValue}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{defaultOptionText}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      ) : (
        <p className="content">
          {options.find((opt) => opt.value === selectedValue)?.text || ''}
        </p>
      )}
    </div>
  );
}
