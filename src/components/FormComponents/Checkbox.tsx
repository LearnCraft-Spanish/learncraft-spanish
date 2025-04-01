export default function Checkbox({
  labelText,
  labelFor,
  value,
  onChange,
}: {
  labelText?: string;
  labelFor: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="lineWrapper">
      <p className="label">{labelText}</p>
      <label htmlFor={labelFor} className="switch">
        <input
          alt={labelFor}
          type="checkbox"
          id={labelFor}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}
