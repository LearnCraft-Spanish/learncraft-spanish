export default function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: React.SetStateAction<string>) => void;
}) {
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor="dateInput">
        Date:
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
