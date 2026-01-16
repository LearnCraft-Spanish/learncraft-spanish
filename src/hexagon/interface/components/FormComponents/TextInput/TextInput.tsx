import { camelize } from '@interface/functions';

export default function TextInput({
  label,
  value,
  onChange,
  editMode,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editMode: boolean;
  required?: boolean;
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label
        className={`label ${required && editMode ? 'required' : ''}`}
        htmlFor={`textInput-${camelLabel}`}
      >{`${label}: `}</label>
      {editMode ? (
        <input
          className="content"
          id={`textInput-${camelLabel}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="content">{value}</p>
      )}
    </div>
  );
}
