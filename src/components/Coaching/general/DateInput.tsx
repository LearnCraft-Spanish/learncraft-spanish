export default function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: React.SetStateAction<string>) => void;
}) {
  return (
    <div className="lineWrapper">
      <label className="label">Date: </label>
      <input
        className="content"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
