import camelize from '@interface/functions/camelize';

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  editMode,
  defaultOptionText,
  required = false,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: string[];
  editMode: boolean;
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
          value={value}
          onChange={(e) => {
            e.preventDefault();
            onChange(e.target.value);
          }}
        >
          <option value={''}>{defaultOptionText || 'Select'}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <p className="content">{value}</p>
      )}
    </div>
  );
}
