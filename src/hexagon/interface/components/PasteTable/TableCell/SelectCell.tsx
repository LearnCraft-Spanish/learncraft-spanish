import type { SelectOption } from '@domain/PasteTable';

export function SelectCell({
  cellValue,
  cellRef,
  commonProps,
  options,
  handleChange,
}: {
  cellValue: string;
  cellRef: (el: HTMLSelectElement | null) => void;
  commonProps: React.HTMLAttributes<HTMLSelectElement>;
  options: SelectOption[];
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      ref={(el) => cellRef(el)}
      value={cellValue}
      onChange={handleChange}
      {...commonProps}
    >
      <option value="">Select...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
