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
}: {
  coachEmail: string;
  onChange: (value: string) => void;
  editMode: boolean;
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
          Coach:
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
