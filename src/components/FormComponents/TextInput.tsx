import camelize from 'src/functions/camelize';

export function TextAreaInput({
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
        htmlFor={`textAreaInput-${camelLabel}`}
      >{`${label}: `}</label>
      {editMode ? (
        <textarea
          className="content"
          id={`textAreaInput-${camelLabel}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p className="content">{value}</p>
      )}
    </div>
  );
}

export function TextInput({
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

export function LinkInput({
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
        htmlFor={`linkInput-${camelLabel}`}
      >{`${label}: `}</label>
      {editMode ? (
        <input
          className="content"
          id={`linkInput-${camelLabel}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : value && value.startsWith('http') ? (
        <a className="content" href={value} target="_blank" rel="noreferrer">
          {label}
        </a>
      ) : (
        <p className="content">{value}</p>
      )}
    </div>
  );
}
