export default function Switch({
  htmlFor,
  value,
  onChange,
}: {
  htmlFor: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={htmlFor} className="switch">
      <input
        alt={htmlFor}
        type="checkbox"
        id={htmlFor}
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="slider round"></span>
    </label>
  );
}
