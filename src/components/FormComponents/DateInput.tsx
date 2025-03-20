export default function DateInput({
  value,
  onChange,
  label = 'Date',
}: {
  value: string;
  onChange: (value: React.SetStateAction<string>) => void;
  label?: string;
}) {
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor="dateInput">
        {`${label}:`}
      </label>
      <input
        id="dateInput"
        className="content"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
