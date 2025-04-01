import { useMemo } from 'react';

import camelize from 'src/functions/camelize';
import { useCoachList } from 'src/hooks/CoachingData/queries';

export default function Dropdown({
  label,
  value,
  onChange,
  options,
  editMode,
  defaultOptionText,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: string[];
  editMode: boolean;
  defaultOptionText?: string;
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={`dropdown-${camelLabel}`}>
        {`${label}: `}
      </label>
      {editMode ? (
        <select
          id={`dropdown-${camelLabel}`}
          className="content"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value={''}>{defaultOptionText || 'Select'}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <p className="content">{value}</p>
      )}
    </div>
  );
}

export function CoachDropdown({
  coachEmail,
  onChange,
  editMode,
  label = 'Coach',
  defaultOptionText = undefined,
}: {
  coachEmail: string;
  onChange: (value: string) => void;
  editMode: boolean;
  label?: string;
  defaultOptionText?: string;
}) {
  const { coachListQuery } = useCoachList();

  const dataReady = coachListQuery.isSuccess;

  const coachName = useMemo(() => {
    const corrector = coachListQuery.data?.find(
      (user) => user.user.email === coachEmail,
    );
    return corrector ? corrector.user.name : 'No Coach Found';
  }, [coachEmail, coachListQuery.data]);

  const sortedCoaches = useMemo(() => {
    if (!coachListQuery.data) {
      return [];
    }
    return coachListQuery.data?.sort((a, b) =>
      a.user.name.localeCompare(b.user.name),
    );
  }, [coachListQuery.data]);

  return (
    dataReady && (
      <div className="lineWrapper">
        <label className="label" htmlFor="coachDropdown">
          {`${label}: `}
        </label>
        {editMode ? (
          <select
            id="coachDropdown"
            className="content"
            value={coachEmail}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value={''}>{defaultOptionText || 'Select'}</option>

            {sortedCoaches.map((coach) => (
              <option key={coach.coach} value={coach.user.email}>
                {coach.user.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="content">{coachName}</p>
        )}
      </div>
    )
  );
}

export interface DropdownOption {
  value: string;
  text: string;
}

export function GenericDropdown({
  label,
  selectedValue,
  onChange,
  options,
  editMode = true,
  defaultOptionText = 'Select',
}: {
  label: string;
  selectedValue: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  editMode?: boolean;
  defaultOptionText?: string;
}) {
  const camelLabel = camelize(label);

  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={`dropdown-${camelLabel}`}>
        {`${label}: `}
      </label>
      {editMode ? (
        <select
          id={`dropdown-${camelLabel}`}
          className="content"
          value={selectedValue}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{defaultOptionText}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      ) : (
        <p className="content">
          {options.find((opt) => opt.value === selectedValue)?.text || ''}
        </p>
      )}
    </div>
  );
}
