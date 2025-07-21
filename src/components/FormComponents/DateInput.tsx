export default function DateInput({
  value,
  onChange,
  label = 'Date',
  required = false,
  editMode = true,
}: {
  value: string;
  onChange: (value: React.SetStateAction<string>) => void;
  label?: string;
  required?: boolean;
  editMode?: boolean;
}) {
  return (
    <div className="lineWrapper">
      <label
        className={`label ${required ? 'required' : ''}`}
        htmlFor="dateInput"
      >
        {`${label}:`}
      </label>
      <input
        id="dateInput"
        className="content"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!editMode}
      />
    </div>
  );
}
