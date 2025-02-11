import { useMemo } from 'react';
import camelize from 'src/functions/camelize';

import useCoaching from 'src/hooks/CoachingData/useCoaching';

export default function Dropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: React.SetStateAction<string>) => void;
  options: string[];
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={camelLabel}>
        {`${label}: `}
      </label>
      <select
        id={camelLabel}
        name={camelLabel}
        className="content"
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CoachDropdown({
  coachEmail,
  onChange,
  editMode,
  label = 'Coach',
}: {
  coachEmail: string;
  onChange: (value: string) => void;
  editMode: boolean;
  label?: string;
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
        <label className="label" htmlFor="coach">
          {`${label}: `}
        </label>
        {editMode ? (
          <select
            id="coach"
            name="coach"
            className="content"
            defaultValue={coachEmail}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select</option>

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

export function DropdownWithEditToggle({
  value,
  onChange,
  editMode,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  editMode: boolean;
  options: string[];
  label: string;
}) {
  const camelLabel = camelize(label);
  return (
    <div className="lineWrapper">
      <label className="label" htmlFor={camelLabel}>{`${label}: `}</label>
      {editMode ? (
        <select
          className="content"
          id={camelLabel}
          name={camelLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select</option>
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
