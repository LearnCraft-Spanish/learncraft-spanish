/**
 *
 * Thesse styles currently live in App.css
 * Move them to a file here when we have a chance
 */

import './ToggleSwitch.scss';

export default function ToggleSwitch({
  id,
  ariaLabel,
  label,
  checked,
  onChange,
  disabled,
}: {
  ariaLabel: string;
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="toggleSwitch">
      <p>{label}</p>
      <label htmlFor={id} className="switch" aria-label={ariaLabel}>
        <input
          type="checkbox"
          name={id}
          id={id}
          checked={checked}
          style={
            checked
              ? { backgroundColor: 'darkgreen' }
              : { backgroundColor: 'darkred' }
          }
          onChange={onChange}
          disabled={disabled}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}
