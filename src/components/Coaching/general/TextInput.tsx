import camelize from 'src/functions/camelize';

export function TextAreaInput({
  label,
  value,
  onChange,
  editMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editMode: boolean;
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={camelLabel}>{`${label}: `}</label>
      {editMode ? (
        <textarea
          className="content"
          id={camelLabel}
          name={camelLabel}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editMode: boolean;
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={camelLabel}>{`${label}: `}</label>
      {editMode ? (
        <input
          className="content"
          id={camelLabel}
          name={camelLabel}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  editMode: boolean;
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={camelLabel}>{`${label}: `}</label>
      {editMode ? (
        <input
          className="content"
          id={camelLabel}
          name={camelLabel}
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
