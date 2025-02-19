import { useMemo } from 'react';
import camelize from 'src/functions/camelize';

import useCoaching from 'src/hooks/CoachingData/useCoaching';

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
          <option value={undefined}>{defaultOptionText || 'Select'}</option>
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
  const { coachListQuery } = useCoaching();

  const dataReady = coachListQuery.isSuccess;

  const coachName = useMemo(() => {
    const corrector = coachListQuery.data?.find(
      (user) => user.user.email === coachEmail,
    );
    return corrector ? corrector.user.name : 'No Coach Found';
  }, [coachEmail, coachListQuery.data]);

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
            <option value={undefined}>{defaultOptionText || 'Select'}</option>

            {coachListQuery.data?.map((coach) => (
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
