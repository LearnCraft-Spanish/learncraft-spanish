export default function Checkbox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="lineWrapper">
      <p className="label">{label}</p>
      <label htmlFor={label} className="switch">
        <input
          alt={label}
          type="checkbox"
          id={label}
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}
