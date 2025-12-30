import { ToggleSwitch } from '@interface/components/general';

export function BooleanCell({
  label = '',
  cellKey,
  ariaLabel,
  cellValue,
  handlers,
}: {
  label?: string;
  cellKey: string;
  ariaLabel: string;
  cellValue: string;
  handlers: { onChange: (value: string) => void };
}) {
  return (
    <ToggleSwitch
      id={cellKey}
      ariaLabel={ariaLabel}
      label={label}
      checked={cellValue === 'true'}
      onChange={() =>
        handlers.onChange(cellValue === 'true' ? 'false' : 'true')
      }
    />
  );
}
